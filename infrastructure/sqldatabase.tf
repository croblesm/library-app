resource "fabric_sql_database" "library_sql_database" {
  workspace_id = fabric_workspace.library_workspace.id
  display_name = var.fabric_sql_database_name
}
