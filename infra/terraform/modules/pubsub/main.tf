# /infra/terraform/modules/pubsub/main.tf

resource "google_pubsub_topic" "topic" {
  name         = var.topic_name
  project      = var.project_id
  kms_key_name = var.kms_key_name

  message_storage_policy {
    allowed_persistence_regions = [var.region]
  }
}

resource "google_pubsub_subscription" "subscription" {
  for_each = var.subscriptions

  name    = each.key
  topic   = google_pubsub_topic.topic.name
  project = var.project_id

  ack_deadline_seconds = 20

  # Dead Letter Policy
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

# Dead Letter Topic for failed messages
resource "google_pubsub_topic" "dead_letter" {
  name         = "${var.topic_name}-dlq"
  project      = var.project_id
  kms_key_name = var.kms_key_name

  message_storage_policy {
    allowed_persistence_regions = [var.region]
  }
}

resource "google_pubsub_subscription" "dead_letter_sub" {
  name    = "${var.topic_name}-dlq-sub"
  topic   = google_pubsub_topic.dead_letter.name
  project = var.project_id
}
