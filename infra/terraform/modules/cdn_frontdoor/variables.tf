# CDN Front Door Module Variables

variable "name_prefix" {
  description = "Prefix for naming CDN Front Door resources"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "backend_hostname" {
  description = "Hostname of the backend API origin"
  type        = string
}

variable "frontend_hostname" {
  description = "Hostname of the frontend web app origin"
  type        = string
}

variable "storage_hostname" {
  description = "Hostname of the storage account origin"
  type        = string
}

variable "tags" {
  description = "Tags to apply to the CDN Front Door resources"
  type        = map(string)
  default     = {}
}
