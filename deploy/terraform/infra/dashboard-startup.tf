# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

resource "google_monitoring_dashboard" "startup_dashboard" {
  project        = var.project_id
  dashboard_json = <<EOF
  {
    "displayName": "MovieGuru-Startup-Dashboard",
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
                    "prometheusQuery": "(sum(rate(movieguru_startup_success_total[$${__interval}])) / sum(rate(movieguru_startup_attempts_total[$${__interval}]))) * 100",
                    "unitOverride": "%",
                    "outputFullDuration": false
                  },
                  "plotType": "LINE",
                  "legendTemplate": "",
                  "targetAxis": "Y1",
                  "dimensions": [],
                  "measures": [],
                  "breakdowns": []
                }
              ],
              "thresholds": [],
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
            "title": "Startup Success Rate",
            "id": ""
          }
        },
        {
          "xPos": 24,
          "width": 24,
          "height": 16,
          "widget": {
            "xyChart": {
              "dataSets": [
                {
                  "timeSeriesQuery": {
                    "prometheusQuery": "histogram_quantile(0.1, sum(rate(movieguru_startup_latency_milliseconds_bucket[$${__interval}])) by (le))\n",
                    "unitOverride": "ms",
                    "outputFullDuration": false
                  },
                  "plotType": "LINE",
                  "legendTemplate": "",
                  "targetAxis": "Y1",
                  "dimensions": [],
                  "measures": [],
                  "breakdowns": []
                },
                {
                  "timeSeriesQuery": {
                    "prometheusQuery": "histogram_quantile(0.5, sum(rate(movieguru_startup_latency_milliseconds_bucket[$${__interval}])) by (le))\n",
                    "unitOverride": "ms",
                    "outputFullDuration": false
                  },
                  "plotType": "LINE",
                  "legendTemplate": "",
                  "targetAxis": "Y1",
                  "dimensions": [],
                  "measures": [],
                  "breakdowns": []
                },
                {
                  "timeSeriesQuery": {
                    "prometheusQuery": "histogram_quantile(0.9, sum(rate(movieguru_startup_latency_milliseconds_bucket[$${__interval}])) by (le))\n",
                    "unitOverride": "ms",
                    "outputFullDuration": false
                  },
                  "plotType": "LINE",
                  "legendTemplate": "",
                  "targetAxis": "Y1",
                  "dimensions": [],
                  "measures": [],
                  "breakdowns": []
                },
                {
                  "timeSeriesQuery": {
                    "prometheusQuery": "histogram_quantile(0.95, sum(rate(movieguru_startup_latency_milliseconds_bucket[$${__interval}])) by (le))\n",
                    "unitOverride": "ms",
                    "outputFullDuration": false
                  },
                  "plotType": "LINE",
                  "legendTemplate": "",
                  "targetAxis": "Y1",
                  "dimensions": [],
                  "measures": [],
                  "breakdowns": []
                },
                {
                  "timeSeriesQuery": {
                    "prometheusQuery": "histogram_quantile(0.99, sum(rate(movieguru_startup_latency_milliseconds_bucket[$${__interval}])) by (le))\n",
                    "unitOverride": "ms",
                    "outputFullDuration": false
                  },
                  "plotType": "LINE",
                  "legendTemplate": "",
                  "targetAxis": "Y1",
                  "dimensions": [],
                  "measures": [],
                  "breakdowns": []
                }
              ],
              "thresholds": [],
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
            "title": "Startup Latency",
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