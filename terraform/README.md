Frontend Infrastructure (Terraform)
=================================

This directory contains the standalone Terraform stack for the BookVerse frontend.
It provisions:

* Public S3 bucket to host the built SPA assets
* CloudFront distribution (HTTPS) with:
  - S3 REST origin for static assets
  - Backend API origin (path pattern: api/*) pointing to existing backend domain
  - SPA fallbacks (403 & 404 -> /index.html)

Inputs (variables):
* project_name (default: bookverse)
* environment (e.g. dev, staging, prod)
* aws_region (default us-east-1)
* backend_api_domain (required) – e.g. ec2-xx-xx-xx-xx.compute-1.amazonaws.com
* backend_api_port (default 3001)

Outputs:
* frontend_s3_bucket
* cloudfront_distribution_id
* cloudfront_domain_name
* frontend_cdn_url
* api_base_url

Usage:

```bash
terraform init
terraform apply -var="backend_api_domain=ec2-52-4-75-180.compute-1.amazonaws.com"
```

After apply, deploy built assets:

```bash
npm run build
aws s3 sync dist/ s3://$(terraform output -raw frontend_s3_bucket)/ --delete \
  --cache-control "max-age=31536000" --exclude "index.html" --exclude "*.html"
aws s3 cp dist/index.html s3://$(terraform output -raw frontend_s3_bucket)/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
aws cloudfront create-invalidation --distribution-id $(terraform output -raw cloudfront_distribution_id) --paths '/*'
```

Security Hardening (future):
* Convert bucket to private + Origin Access Control (OAC)
* Add WAF to CloudFront
* Restrict API origin invocation via custom header
