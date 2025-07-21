# CDN Front Door Module Outputs

output "profile_id" {
  description = "ID of the Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.main.id
}

output "profile_name" {
  description = "Name of the Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.main.name
}

output "endpoint_id" {
  description = "ID of the Front Door endpoint"
  value       = azurerm_cdn_frontdoor_endpoint.main.id
}

output "endpoint_url" {
  description = "URL of the Front Door endpoint"
  value       = "https://${azurerm_cdn_frontdoor_endpoint.main.host_name}"
}

output "endpoint_hostname" {
  description = "Hostname of the Front Door endpoint"
  value       = azurerm_cdn_frontdoor_endpoint.main.host_name
}

output "waf_policy_id" {
  description = "ID of the WAF policy"
  value       = azurerm_cdn_frontdoor_firewall_policy.main.id
}

output "waf_policy_name" {
  description = "Name of the WAF policy"
  value       = azurerm_cdn_frontdoor_firewall_policy.main.name
}

output "backend_origin_group_id" {
  description = "ID of the backend origin group"
  value       = azurerm_cdn_frontdoor_origin_group.backend.id
}

output "frontend_origin_group_id" {
  description = "ID of the frontend origin group"
  value       = azurerm_cdn_frontdoor_origin_group.frontend.id
}

output "storage_origin_group_id" {
  description = "ID of the storage origin group"
  value       = azurerm_cdn_frontdoor_origin_group.storage.id
}
