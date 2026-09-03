output "capacity_id" {
  value = fabric_workspace.library_workspace.capacity_id
}

output "sql_database_id" {
  value = fabric_sql_database.library_sql_database.id
}

output "sql_database_name" {
  value = fabric_sql_database.library_sql_database.properties.database_name
}

output "sql_database_server_fqdn" {
  value = fabric_sql_database.library_sql_database.properties.server_fqdn
}

# Marked sensitive so Terraform redacts it in CLI output, plans and CI logs.
# Read it deliberately with: terraform output -raw sql_database_connection_string
output "sql_database_connection_string" {
  value     = fabric_sql_database.library_sql_database.properties.connection_string
  sensitive = true
}
