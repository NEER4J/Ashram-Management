-- ==========================================
-- Course Lessons Structure Migration
-- ==========================================
-- This migration adds lesson-level structure to courses
-- Course → Module → Lesson hierarchy

-- ==========================================
-- 1. Create course_lessons table
-- ==========================================

create table if not exists course_lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references course_modules(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text,
  video_type text check (video_type in ('vimeo', 'loom', 'youtube', 'custom')),
  video_duration_seconds integer default 0,
  order_index integer not null default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 2. Create user_lesson_progress table
-- ==========================================

create table if not exists user_lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  enrollment_id uuid references course_enrollments(id) on delete cascade not null,
  lesson_id uuid references course_lessons(id) on delete cascade not null,
  progress_percentage numeric(5, 2) default 0,
  watch_time_seconds integer default 0,
  is_completed boolean default false,
  last_watched_at timestamptz default now(),
  completed_at timestamptz,
  unique(enrollment_id, lesson_id)
);

-- ==========================================
-- 3. Add last_accessed_lesson_id to course_enrollments
-- ==========================================

alter table course_enrollments 
  add column if not exists last_accessed_lesson_id uuid references course_lessons(id) on delete set null;

-- ==========================================
-- 4. Migrate existing module content to lessons
-- ==========================================
-- For each module that has content, create a lesson

do $$
declare
  module_record record;
  lesson_count integer;
begin
  for module_record in 
    select id, course_id, title, description, content_type, content_url, duration_minutes, order_index
    from course_modules
    where content_url is not null or content_type is not null
  loop
    -- Determine video_type from content_type
    declare
      video_type_value text;
      video_url_value text;
    begin
      video_type_value := case 
        when module_record.content_type = 'Video' then 'custom'
        else 'custom'
      end;
      
      video_url_value := module_record.content_url;
      
      -- Create a lesson from the module content
      insert into course_lessons (
        module_id,
        title,
        description,
        video_url,
        video_type,
        video_duration_seconds,
        order_index,
        is_active
      ) values (
        module_record.id,
        coalesce(module_record.title, 'Lesson 1'),
        module_record.description,
        video_url_value,
        video_type_value,
        coalesce(module_record.duration_minutes, 0) * 60,
        0,
        true
      );
    end;
  end loop;
end $$;

-- ==========================================
-- 5. Migrate existing module_progress to lesson progress
-- ==========================================
-- For each module_progress, find the corresponding lesson and create progress

do $$
declare
  progress_record record;
  lesson_id_value uuid;
begin
  for progress_record in 
    select 
      mp.enrollment_id,
      mp.module_id,
      mp.completed_at,
      mp.time_spent_minutes,
      mp.last_accessed_at,
      ce.user_id
    from module_progress mp
    join course_enrollments ce on ce.id = mp.enrollment_id
  loop
    -- Find the first lesson in this module (migrated lesson)
    select id into lesson_id_value
    from course_lessons
    where module_id = progress_record.module_id
    order by order_index
    limit 1;
    
    if lesson_id_value is not null then
      -- Create lesson progress from module progress
      insert into user_lesson_progress (
        user_id,
        enrollment_id,
        lesson_id,
        progress_percentage,
        watch_time_seconds,
        is_completed,
        last_watched_at,
        completed_at
      ) values (
        progress_record.user_id,
        progress_record.enrollment_id,
        lesson_id_value,
        case when progress_record.completed_at is not null then 100 else 0 end,
        coalesce(progress_record.time_spent_minutes, 0) * 60,
        progress_record.completed_at is not null,
        coalesce(progress_record.last_accessed_at, now()),
        progress_record.completed_at
      )
      on conflict (enrollment_id, lesson_id) do nothing;
    end if;
  end loop;
end $$;

-- ==========================================
-- 6. Create indexes for performance
-- ==========================================

create index if not exists idx_course_lessons_module on course_lessons(module_id);
create index if not exists idx_course_lessons_order on course_lessons(module_id, order_index);
create index if not exists idx_user_lesson_progress_user on user_lesson_progress(user_id);
create index if not exists idx_user_lesson_progress_enrollment on user_lesson_progress(enrollment_id);
create index if not exists idx_user_lesson_progress_lesson on user_lesson_progress(lesson_id);
create index if not exists idx_course_enrollments_last_lesson on course_enrollments(last_accessed_lesson_id);

-- ==========================================
-- 7. Trigger for updated_at on course_lessons
-- ==========================================

create trigger update_course_lessons_updated_at
  before update on course_lessons
  for each row
  execute function update_updated_at_column();

-- ==========================================
-- 8. Function to calculate course progress from lessons
-- ==========================================

create or replace function calculate_course_progress_from_lessons(p_enrollment_id uuid)
returns numeric as $$
declare
  total_lessons integer;
  completed_lessons integer;
  progress_value numeric;
begin
  -- Get total lessons in the course
  select count(*) into total_lessons
  from course_lessons cl
  join course_modules cm on cl.module_id = cm.id
  join course_enrollments ce on ce.course_id = cm.course_id
  where ce.id = p_enrollment_id
    and cl.is_active = true;
  
  if total_lessons = 0 then
    return 0;
  end if;
  
  -- Get completed lessons
  select count(*) into completed_lessons
  from user_lesson_progress ulp
  where ulp.enrollment_id = p_enrollment_id
    and ulp.is_completed = true;
  
  progress_value := (completed_lessons::numeric / total_lessons::numeric) * 100;
  return round(progress_value, 2);
end;
$$ language plpgsql;

-- ==========================================
-- 9. Trigger to auto-update course enrollment progress
-- ==========================================

create or replace function update_enrollment_progress_on_lesson_complete()
returns trigger as $$
begin
  -- Update course enrollment progress when lesson is completed
  if NEW.is_completed = true and (OLD.is_completed is null or OLD.is_completed = false) then
    update course_enrollments
    set progress_percentage = calculate_course_progress_from_lessons(NEW.enrollment_id),
        last_accessed_at = now()
    where id = NEW.enrollment_id;
    
    -- Check if course is completed
    declare
      total_lessons integer;
      completed_lessons integer;
    begin
      select count(*) into total_lessons
      from course_lessons cl
      join course_modules cm on cl.module_id = cm.id
      join course_enrollments ce on ce.course_id = cm.course_id
      where ce.id = NEW.enrollment_id
        and cl.is_active = true;
      
      select count(*) into completed_lessons
      from user_lesson_progress ulp
      where ulp.enrollment_id = NEW.enrollment_id
        and ulp.is_completed = true;
      
      if total_lessons > 0 and completed_lessons >= total_lessons then
        update course_enrollments
        set completed_at = now()
        where id = NEW.enrollment_id and completed_at is null;
      end if;
    end;
  end if;
  
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_update_enrollment_on_lesson_complete
  after insert or update on user_lesson_progress
  for each row
  execute function update_enrollment_progress_on_lesson_complete();

