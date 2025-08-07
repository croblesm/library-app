variable "fabric_workspace_name" {
  description = "Name for the Workspace to be created or already exists."
  type        = string
}

variable "fabric_sql_database_name" {
  description = "Name for the SQL database to be created."
  type        = string
}

variable "fabric_capacity_name" {
  description = "Fabric capacity where workspace/SQL database need to be created."
  type        = string
}
