data "fabric_capacity" "capacity" {
  display_name = var.fabric_capacity_name
}

resource "fabric_workspace" "library_workspace" {
  display_name = "library-app-workspace" # Use a unique, non-reserved name
  description  = "Library workspace for managing resources"
  capacity_id  = data.fabric_capacity.capacity.id
}