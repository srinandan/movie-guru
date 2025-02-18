resource "google_monitoring_dashboard" "startup_dashboard" {
  project        = var.project_id
  dashboard_json = <<EOF
  {
  "displayName": "Model API Rate",
  "mosaicLayout": {
    "columns": 48,
    "tiles": [
      {
        "width": 24,
        "height": 16,
        "widget": {
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "metric.type=\"aiplatform.googleapis.com/quota/generate_content_requests_per_minute_per_project_per_base_model/usage\" resource.type=\"aiplatform.googleapis.com/Location\" metric.label.\"base_model\"=\"gemini-1.5-flash\" resource.label.\"location\"=\"us-west1\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_RATE",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": []
                    }
                  },
                  "unitOverride": "",
                  "outputFullDuration": false
                },
                "plotType": "LINE",
                "legendTemplate": "",
                "minAlignmentPeriod": "60s",
                "targetAxis": "Y1",
                "dimensions": [],
                "measures": [],
                "breakdowns": []
              }
            ],
            "thresholds": [
              {
                "label": "",
                "value": 3.33,
                "color": "COLOR_UNSPECIFIED",
                "direction": "DIRECTION_UNSPECIFIED",
                "targetAxis": "Y1"
              }
            ],
            "yAxis": {
              "label": "",
              "scale": "LINEAR"
            },
            "chartOptions": {
              "mode": "COLOR",
              "showLegend": false,
              "displayHorizontal": false
            }
          },
          "title": "RateLimit",
          "id": ""
        }
      }
    ]
  },
  "dashboardFilters": [],
  "labels": {}
}
  EOF
}