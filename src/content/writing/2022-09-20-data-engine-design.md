---
title: "Data Engine Design"
date: 2022-09-20
canonical: "https://medium.com/@george.pearse/data-engine-design-9b29a20ff9f0"
tags: ["supervised-learning", "machine-learning", "data-engine", "ml-so-good", "deep-learning"]
---

Breaking down the systems of the top ML companies (with a strong Computer Vision focus).

![](/GeorgePearse/writing-images/553e340189f96c7f.png)

_a big engine_

Tesla created the term “Data Engine” to describe what is more generally known as a “Data Flywheel”. I’d summarise a “Data Flywheel” as:

> A system which uses model outputs to improve training datasets

These training datasets can then be used to create better models, and so the ‘flywheel’ spins. A Data Engine has 3 main components or modules:

- **Active Learning** — selecting the most valuable datapoints to label.

- **Dataset Cleaning** — ensuring that your Ground Truth labels are accurate and self-consistent.

- **Auto-labelling** — using your model predictions as a starting point for training labels. Instead of starting from scratch in your labelling tool, just correct the predictions of your current best model.

Let’s dive into each in more depth.

## Active Learning

Active Learning is the the problem of finding the most valuable datapoints to label, where value is defined by the per-datapoint model improvement against some ML metric. When you’re working on improving a weak baseline, the easiest instances may be the most valuable, but as your model improves, it quickly becomes the case that the hardest instances contain the most useful information to the model. Human intuition wrt. learning works perfectly, the only adaptation being the sheer volume of data required to teach an ML model. Meta recently released an excellent paper on “Data Pruning” which explains these concepts in great depth.

[https://arxiv.org/abs/2206.14486](https://arxiv.org/abs/2206.14486)

See BAAL to get started.

[GitHub - baal-org/baal: Library to enable Bayesian active learning in your research or labeling work.](https://github.com/baal-org/baal)

## Dataset Cleaning

Dataset cleaning is the art of iteratively improving the quality of your ground truth labels. Your dataset probably suffers from two problems - random annotation mistakes and bias. In the case of random mistakes, it can be remedied by a very large dataset, but this is often wasteful (both of human time and GPU resource) and unnecessary.

The simplest approach is to stop training a model early, before it’s memorised the training set, and then use this model to run inference back over its own training set. The frames with the largest disagreement between the original labels and the model’s predictions are likely to include incorrect annotations. Send the top X of these to your labelling tool, and correct where appropriate.

See cleanlab to get started.

[GitHub - cleanlab/cleanlab: The standard data-centric AI package for data quality and machine learning with messy, real-world data and labels.](https://github.com/cleanlab/cleanlab)

## Auto-Labelling

Most annotation tools now make it very easy to send your model’s predictions as a starting point for annotation. This is particularly valuable for object detection, where the most valuable human input may be to correct one wrong prediction in a frame that includes one hundred correct predictions.

A particularly popular combination is to use Voxel51 and CVAT to support such a workflow. See Voxel’s docs for more detail.

[Annotating Datasets - FiftyOne 0.21.0 documentation](https://docs.voxel51.com/user_guide/annotation.html)

## Conclusion

This set-up is increasingly becoming available ‘off-the-shelf’. Companies like V7 labs and Scale AI provide much of the tooling to get you there, with only the help of a large pay check. In reality however, 90% of the gains can be achieved through a pretty simple set-up built around open-source tools like cleanlab, CVAT, Voxel Fiftyone and maybe the odd Streamlit app. Where the “paid for services” distinguish themselves is in environments where you must juggle and update many production models.

Make your Data Engine look more like a Tesla’s and less like a Fiat’s.
