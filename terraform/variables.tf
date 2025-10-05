variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "project_name" {
  type    = string
  default = "bookverse"
}

variable "backend_api_domain" {
  description = "Public DNS/Domain of backend API origin"
  type        = string
}

variable "backend_api_port" {
  type    = number
  default = 3001
}
