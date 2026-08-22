---
title: "Floating on Open-Source"
date: 2022-08-26
canonical: "https://medium.com/@george.pearse/floating-on-open-source-bd6ff3817afb"
tags:
  ["software-development", "open-source", "machine-learning", "ml-so-good", "software-engineering"]
---

Many Machine Learning businesses are really just a tech team floating on a pile of open-source projects combined with a large, and expensive dataset. The amount of original technical work is low (and should be) and mostly involves bringing a few different APIs together and ensuring that they play nicely.

- Model Serving — (open-source e.g. TorchServe, FastAPI, Bento etc.)

- Model Training — (Pytorch-Lightning, TensorFlow, Composer etc.)

- Experiment Tracking — (MLFlow, TensorBoard etc.)

> Open-source projects come and go, but you must ride the wave.

The reality of this should be fully embraced. Your core responsibility is to pick the right tools, know how heavily you can afford to commit your stack to each, and know when to move on.

![](/GeorgePearse/writing-images/e2ae443ac997b107.png)

_Riding on Open-Source_

This does have some technical consequences. Certain design patterns favour the ability to quickly chop-and-change the underlying implementation. The core to these techniques though is really just to avoid writing too much code that is specific to an API choice that may not last. Laszlo Sragner has already written well on the topic.

[You only need 2 Design Patterns to improve the quality of your code in a data science project (substack.com)](https://laszlo.substack.com/p/you-only-need-2-design-patterns-to)

[Mlearning.ai Submission Suggestions](https://medium.com/mlearning-ai/mlearning-ai-submission-suggestions-b51e2b130bfb)
