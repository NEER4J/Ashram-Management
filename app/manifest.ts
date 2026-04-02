import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ashram Management",
    short_name: "Ashram",
    description: "Manage your Ashram operations efficiently",
    start_url: "/",
    display: "standalone",
    background_color: "#fef9fb",
    theme_color: "#3c0212",
  }
}
