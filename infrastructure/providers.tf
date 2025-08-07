terraform {
  required_version = ">= 1.5.7, < 2.0"
  required_providers {
    fabric = {
      source  = "microsoft/fabric"
      version = ">= 1.4.0"
    }
  }
}


provider "fabric" {
  preview = true
}
