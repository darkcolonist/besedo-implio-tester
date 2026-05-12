based on this documentation
let me specify the api key manually along with the url of the image
https://besedo.stoplight.io/docs/implio-api/4834d17b819f7-submit-a-batch-of-ads-to-implio-for-moderation-or-update

[
  {
    "id": "img_001",
    "content": {
      "title": "Furniture for sale",
      "images": [
        {"src": "https://example.com/item-photo.jpg"}
      ]
    },
    "user": {
      "id": "user_99"
    }
  }
]

now to get moderation results i have to manually fetch (given the task id per item)
https://besedo.stoplight.io/docs/implio-api/5bab2e09a5463-retrieve-moderation-ads-results

now, can you make me a basic front-end using vite+react for above use-case please

---

sample #1
  input:
  [
    {
      "id": "img_placeholder_id_001",
      "content": {
        "title": "moderate this image",
        "images": [
          {"src": "https://core-ap-southeast-1-shared-storage.s3.ap-southeast-1.amazonaws.com/apps/s3files/storage/stage/2026-05-12T05-45-48-966Z_4ada2e9c_69919149_033_4cee.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYIJASCBUKQLHJH3C%2F20260512%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260512T054549Z&X-Amz-Expires=604800&X-Amz-Signature=05e88ffcf4cf351e10d7eb555630c5beed1466baa21589bb68b803536e13cac1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"}
        ]
      },
      "user": {
        "id": "user_99"
      }
    }
  ]

  output:
    {
      "batchId": "6e86424a-68dc-4d65-b16b-de4cccb54e6c",
      "accepted": [
        {
          "id": "img_placeholder_id_001",
          "taskId": "6cb13564-1551-4f79-afdb-ba06d2097f35"
        }
      ],
      "rejected": []
    }
