---
title: "Active Learning for Deep Learning"
date: 2022-08-16
canonical: "https://medium.com/@george.pearse/active-learning-for-deep-learning-312a1657c4c1"
tags: ["ml-so-good", "python", "technology", "machine-learning", "deep-learning"]
---

How to choose what datapoints to label.

Data Centric AI is suddenly all the rage, big names in the ML community like Angrew Ng and James Zhou (Stanford) have come forward to try to end modelitis (throwing the latest and greatest model architecture at a problem). They’re pushing for a move towards a more sustainable and systematic approach to improving the performance of ML systems.

Yet very little is often said about the exact techniques that can be applied.

There are three main components to Data Centric AI:

- **Highly granular evaluation sets** focused on a specific problem. In the context of Computer Vision this can be achieved with nearest neighbours over embeddings either with torch.cdist, annoy or faiss depending on the dataset size.

[Vector Databases for Data-Centric AI](https://medium.com/mlearning-ai/the-many-uses-of-a-vector-database-65cb6cc70b3f)

- **Dataset Cleaning.** The removal of instances that are mislabelled or out of the relevant distribution. Often involves **_Data Valuation_** techniques, where many permutations of the dataset are sampled within the training set in order to determine their value for a specific task. Examples include Leave-One-Out (LOO), approximations of Data Shapley Values and Reinforcement Learning for Data Valuation.

[Estimating the Impact of Training Data with Reinforcement Learning](https://ai.googleblog.com/2020/10/estimating-impact-of-training-data-with.html)

- **Active Learning.** The task of selecting which data-points to label in order to maximise the per data-point model improvement.

This article will focus on Active Learning.

![](/GeorgePearse/writing-images/e4c36e5bb0ebfd8e.png)

_[https://product.hubspot.com/blog/bayesian-active-learning](https://product.hubspot.com/blog/bayesian-active-learning)_

Active Learning is most useful when labelling is expensive e.g. requires experts in the domain, and there’s a large pool of unlabelled instances to choose from.

Three components can be mixed and matched in Active Learning:

- Selecting data-points with a high model ‘uncertainty’.

- Selecting data-points to label in order to be representative of the full set.

- Selecting data-points in order to maximize diversity.

The latter two may sound similar but representative sampling should be thought of as matching the distribution of the full population (labelled and unlabelled alike), while diversity sampling focuses on maximising the coverage of a given **latent space** (outliers are highly ranked by such a system).

> “A latent space, also known as a latent feature space or embedding space, is **an embedding of a set of items within a manifold in which items which resemble each other more closely are positioned closer to one another in** the latent space.”

Due to the long training times of Deep Neural Networks and the insignificance of a single datapoint to the behaviour of a model, Active Learning tends to be applied in contexts in which a batch of data is submitted for labelling. This increases the importance of the diversity component. Uncertainty sampling techniques applied in batch form are likely to ‘oversolve’ a specific problem. For a model designed to detect bone fractures that is currently particularly weak at identifying wrist fractures, a model uncertainty based technique may only select wrist fractures, even if only a small number of examples is sufficient to correct for the problem.

It’s like a student failing a mock exam partially due to a long division problem only studying long division from then on to the detriment of any other weaknesses. [https://oatml.cs.ox.ac.uk/blog/2019/06/24/batchbald.html](https://oatml.cs.ox.ac.uk/blog/2019/06/24/batchbald.html) This article excellently explains this problem and shows an uncertainty based technique being outperformed by random selection in the batch setting.

![](/GeorgePearse/writing-images/8b2fa4ba38391caf.png)

_Random selection outperforms BALD when selecting data-points in batch. [https://oatml.cs.ox.ac.uk/blog/2019/06/24/batchbald.html](https://oatml.cs.ox.ac.uk/blog/2019/06/24/batchbald.html)_

The best techniques in the batch setting tend to be a combination of uncertainty sampling and diversity sampling. If you need to apply Active Learning to your own problem. The most mature package for Active Learning in the context of Deep Learning is BAAL.

[GitHub - baal-org/baal: Library to enable Bayesian active learning in your research or labeling work.](https://github.com/baal-org/baal)

This is a very active area and new tools are popping up frequently. You can check [https://github.com/stars/GeorgePearse/lists/active-learning](https://github.com/stars/GeorgePearse/lists/active-learning) for a list of repos worth a further look in this area.

Let me know your thoughts. Please click follow if the content interests you. I’m currently looking for my next role.

## References

- [https://oatml.cs.ox.ac.uk/blog/2019/06/24/batchbald.html](https://oatml.cs.ox.ac.uk/blog/2019/06/24/batchbald.html)

## Further Reading

- [https://towardsdatascience.com/advanced-active-learning-cheatsheet-d6710cba7667](https://towardsdatascience.com/advanced-active-learning-cheatsheet-d6710cba7667). Written by the author of Human-in-the-Loop Machine Learning (highly recommended).

- [https://jacobgil.github.io/deeplearning/activelearning](https://jacobgil.github.io/deeplearning/activelearning). Excellent blog post covering the latest and greatest of Active Learning along with the situations in which it’s most useful.

- [https://devblog.pytorchlightning.ai/active-learning-made-simple-using-flash-and-baal-2216df6f872c](https://devblog.pytorchlightning.ai/active-learning-made-simple-using-flash-and-baal-2216df6f872c). Written by the PyTorch Lightning team.

- [https://medium.com/@ODSC/active-learning-your-models-new-personal-trainer-a89722c0db5a](https://medium.com/@ODSC/active-learning-your-models-new-personal-trainer-a89722c0db5a)

[Mlearning.ai Submission Suggestions](https://medium.com/mlearning-ai/mlearning-ai-submission-suggestions-b51e2b130bfb)
