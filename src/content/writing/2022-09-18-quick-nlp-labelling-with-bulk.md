---
title: "Quick NLP Labelling with Bulk"
date: 2022-09-18
canonical: "https://medium.com/@george.pearse/quick-nlp-labelling-with-bulk-327ccb62320"
tags: ["visualization", "ml-so-good", "data-science", "nlp", "machine-learning"]
---

An NLP POC in an afternoon.

> So you have an internal free-text dataset, but you don’t have labels, and you don’t know how easy it will be to make them, enter bulk.

[GitHub - koaning/bulk: A Simple Bulk Labelling Tool](https://github.com/koaning/bulk)

A great way to estimate how difficult a Machine Learning project will be, is to see if the clusters align with how you’d want to break down the classes. Or for a binary problem, if the class boundary you’d be interested in already at least partially aligns with a single cluster.

![](/GeorgePearse/writing-images/c420092ca58eea2e.png)

_clustering in bulk._

Bulk stands out for the quality of its EDA (exploratory data analysis), the scatter chart is made with bokeh and enables arbitrary zooming in and out. To go from a highly granular view, to the dataset ‘from 1 million miles out’. You can also colour by any set of keywords.

To colour by keywords you specify them from the terminal when running the program:

```
python -m bulk text ready.csv --keywords "F1,hair,sun,fight,rain"
```

<a href="https://medium.com/media/2e5de2ec38b0ed66ca47d51f01ea137e/href">https://medium.com/media/2e5de2ec38b0ed66ca47d51f01ea137e/href</a>

It differentiates itself from equivalent tools by the ability to then apply quick labels. Taking you out of EDA and into action. It is un-opinionated, meaning you can apply your own choice of dimensionality reduction (umap, t-sne, take your pick).

[SNE vs. t-SNE vs. UMAP: An Evolutionary Guide](https://arize.com/blog/t-sne-vs-umap/)

This design choice also makes it much more performant than some equivalent tools like the tensorboard embedding projector. The browser only has to receive 2 dimensions worth of data (x and y coordinates), instead of the several thousand of the original vector, greatly reducing the required data transfer from server to client/browser.

[Embedding projector - visualization of high-dimensional data](https://projector.tensorflow.org/)

After highlighting a section of the chart, you can export a named csv (named with the label) store of those records, ready to use to train a model.

### The Dataset

I’ve chosen an open-source twitter dataset (from around 2009). The 30k sample (post dimensionality reduction, with raw tweets) used in the demo is available at:

[https://github.com/GeorgePearse/bulk-demo/blob/main/ready](https://github.com/GeorgePearse/bulk-demo/blob/main/ready) (1).csv

The biggest advantage of this dataset is that there’s a natural limit to the size of the free text in tweets. Short snippets are where the simple UI of bulk really shines.

## The Code

The below code uses the SentenceTransformer API which is written on top of Hugging Face. I find Hugging Face unreasonably awkward to use, but this thin API is great for NLP POCs.

[SentenceTransformers Documentation - Sentence-Transformers documentation](https://www.sbert.net)

<a href="https://medium.com/media/9773d24e520e179d80c0edc46af291b8/href">https://medium.com/media/9773d24e520e179d80c0edc46af291b8/href</a>

## The Pre-Trained Model

Plucked from the sbert website, which will have plugged it from hugging-face.

![](/GeorgePearse/writing-images/a33b63642e8eb0fc.png)

_all-mpnet-base-v2 model card._

Huge credit to Vincent Warmerdam for creating bulk and a set of other well-defined, clever tools. Check out his GitHub at [https://github.com/koaning](https://github.com/koaning).

Please clap and follow if this content interests you. I’ll be trying to focus on longer form content and projects over the next few months. Closing the gap between hobby project and production application.

[Mlearning.ai Submission Suggestions](https://medium.com/mlearning-ai/mlearning-ai-submission-suggestions-b51e2b130bfb)
