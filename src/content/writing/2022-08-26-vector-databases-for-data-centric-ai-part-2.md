---
title: "Vector Databases for Data-Centric AI (Part 2)"
date: 2022-08-26
canonical: "https://medium.com/@george.pearse/vector-databases-for-data-centric-ai-part-2-ba995053ce05"
tags: ["data-centric-ai", "ml-so-good", "vector-database", "deep-learning", "machine-learning"]
---

Building applications with QDrant, Hugging-Face and Streamlit.

QDrant have created an excellent vector database and I suspect ML Engineers are only beginning to scratch its potential applications.

Vector databases support hybrid similarity search and provide a CRUD API to run updates to your datasets. They are a significant improvement upon first-wave Approximate Nearest Neighbour tools like Faiss and Annoy which enable very high performance in-memory vector search but little in the way of support for update flows, nor metadata filters.

I’ve already written about some of the applications of these tools here.

[Vector Databases for Data-Centric AI](https://medium.com/mlearning-ai/the-many-uses-of-a-vector-database-65cb6cc70b3f)

> **Hybrid search** is **vector or “semantic”** search combined with attribute filtering.

The semantic search implemented by QDrant requires a list of positive and negative examples. Each positive datapoint is an example of what you want the responses to be similar to, each negative datapoint is an example of what you want the responses to be different to.

![](/GeorgePearse/writing-images/3430b6b3b0fcb068.png)

This allows you to build up arbitrarily complex decision boundaries within your feature space.

![](/GeorgePearse/writing-images/2dc796a5c07f36f5.png)

An example QDrant query:

```
{"positive": [0],
"negative": [1],
"top": 10,
"with_payload": true}
```

**This enables the interactive definition of classes:**

- Start with a single positive datapoint.

- Look through the responses.

- Add those that you consider to be similar to the list of positives

- Add those you consider to be different to the list of negatives

- Run that new query, and repeat.

After a batch of labelling you would also be in a position to improve your embeddings and continue the process with a _‘better’_ separated dataset (I’ll be experimenting more with this next).

I’ve built a mini Streamlit application to support this flow and enable you to save each query once complete along with a CSV containing its results.

## QDrant-NLP Demo

<a href="https://medium.com/media/26baf28142ed0730f13cc7fc68176b9e/href">https://medium.com/media/26baf28142ed0730f13cc7fc68176b9e/href</a>

## How to Run

[GitHub - GeorgePearse/QDrant-NLP: QDrant-NLP](https://github.com/GeorgePearse/QDrant-NLP)

Just clone the repo and run:

```
docker-compose up
```

I would like to increase the number of datasets this can be tried on, either with GPU backed lambda functions or by saving many example datasets to S3. So far I’ve only made a 6K subset of ag_news available. [ag_news · Datasets at Hugging Face](https://huggingface.co/datasets/ag_news)

This is the code snippet used to generate the embeddings via hugging-face:

<a href="https://medium.com/media/0cd3ec8a1dceba5b4058319be653e0cf/href">https://medium.com/media/0cd3ec8a1dceba5b4058319be653e0cf/href</a>

## Where to Use

Shout out to both Kern.AI (an excellent open-source NLP labelling tool)

[https://github.com/code-kern-ai/refinery](https://github.com/code-kern-ai/refinery)

and Voxel51 (an excellent open-source Computer Vision analysis tool)

[https://github.com/voxel51/fiftyone](https://github.com/voxel51/fiftyone)

for being early adopters of the technology in their platforms, but I don’t believe either have yet made use of all of the value it can provide.

## Other Reads in Data-Centric AI

[Introduction to micro-models or: how I learned to stop worrying and love overfitting | by Eric Landau | Medium](https://eric-landau.medium.com/introduction-to-micro-models-or-how-i-learned-to-stop-worrying-and-love-overfitting-fd8fbe98e99b)

[Mlearning.ai Submission Suggestions](https://medium.com/mlearning-ai/mlearning-ai-submission-suggestions-b51e2b130bfb)
