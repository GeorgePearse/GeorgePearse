---
title: "The Missing Terminology of Data Centric AI"
date: 2023-12-16
canonical: "https://medium.com/@george.pearse/the-missing-terminology-of-data-centric-ai-5a0afb488817"
tags: ["data-centric-ai", "computer-vision", "data-science", "machine-learning"]
---

Data Centric AI is part marketing gimmick, but also has its value in places. This article quickly goes through some terms the industry could benefit from, in order to understand the data problems presented by supervised learning at scale and speed.

## Data Viscosity

![](/GeorgePearse/writing-images/4c458ae526c268cc.png)

_a viscous liquid_

As a dataset gets larger, it becomes more and more difficult to alter it in order to train models to respond to requests from customers.

Early datapoints may be labelled with classes which have since become more specific.

> **“Oh could you just add X”**

This can be an intimidating question if you’ve already scaled your dataset to many 10s of thousands of images in order to achieve your required accuracy, but with a dense set of informative images, and clean labels, it can be a much more manageable scenario.

Another symptom is that you’re also unable to experiment at the speed you once could, and are no longer able to iterate through ideas at the rate you feel should be possible. A potential solution is to always train on **‘best subsets’**, steadily removing data which may have become redundant due to over-representation.

## **Dataset Claustrophobia**

![](/GeorgePearse/writing-images/3b436a093adffbaf.png)

_looking claustrophobic_

Your dataset is too large for the tools that you use for you to ever feel like you’re achieving a **“birds eye view”**, and have confidence that there’s not a large set of erroneous labels that you’re unaware of.

See my article on using ‘bulk’ [https://medium.com/mlearning-ai/quick-nlp-labelling-with-bulk-327ccb62320](https://medium.com/mlearning-ai/quick-nlp-labelling-with-bulk-327ccb62320) for a potential remedy, but voxel51 [https://voxel51.com/](https://voxel51.com/) also serves a similar purpose in the context of Computer Vision.

A core part of combating this, is to use tools with appropriate speed for the scale of your dataset. It may be worth training an additional fast, but less accurate model, just as a tool to sift through unannotated images, or to try to find blatent errors in the training set (provided that fast model has not memorised the training annotations).

## **Defensive Classes**

![](/GeorgePearse/writing-images/b63d64bc1b90e91d.png)

The client does not directly care about the class, but its existence helps the model to train, and allows you to understand errors at a larger scale.

It is a **“defensive class”**, because it’s main purpose is to prevent the model from getting confused between it, and a “**product class”**.

Many of these terms exist to address the under-appreciated downsides of scale. Scale is great for a large, well funded team, but has its drawbacks if you’re trying to move fast in a resource constrained environment.

Thanks for reading!
