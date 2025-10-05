output "frontend_s3_bucket" { value = aws_s3_bucket.frontend.bucket }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.frontend.id }
output "cloudfront_domain_name" { value = aws_cloudfront_distribution.frontend.domain_name }
output "frontend_cdn_url" { value = "https://${aws_cloudfront_distribution.frontend.domain_name}" }
output "api_base_url" { value = "https://${aws_cloudfront_distribution.frontend.domain_name}/api" }
output "backend_api_domain" { value = var.backend_api_domain }
