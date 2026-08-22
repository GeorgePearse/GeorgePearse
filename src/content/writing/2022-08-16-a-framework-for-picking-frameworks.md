---
title: "A Framework for Picking Frameworks"
date: 2022-08-16
canonical: "https://medium.com/@george.pearse/a-framework-for-picking-frameworks-a4cd273e0e18"
tags: ["machine-learning", "data-engineering", "software-development", "python", "open-source"]
---

How to choose your next Open-Source tool. 5 things to consider.

![](/GeorgePearse/writing-images/0dccd0af6e2a7353.png)

_choice making temp placeholder. image by author._

With the rise of the Modern Data Stack, images like this (below) have become commonplace. I would recommend a view of the original high-res image and article (link in the caption).

![](/GeorgePearse/writing-images/eb89fc9002a53403.png)

_Serious credits to Matt Turck. [A Turbulent Year: The 2019 Data & AI Landscape — Matt Turck](https://mattturck.com/data2019/)_

What’s obvious is that it’s a congested space. The problem as a professional in the field is to know where to focus your attention. When each tool requires deployment to k8s how do you decide where to start?

**1.Time to POC**

With so many tools out there what really matters is how quickly you can come to an informed decision with respect to whether the tool will add value to your team. What matters here is the time to a POC, in this POC you’ll probably either realise it’s not for you, or reach the point where you want to convince your manager to take it further. It’s the MVP of demos.

For a pip installable package or a docker-compose service, the set-up process can be almost instant. A k8s helm chart can take significantly longer to set-up as you would actually use it in your team.

**2.Time to Value**

Once you pick a tool how long will it be until you’re moving faster than whatever you were using before. This is a combination of the learning curve and the level of efficiency that it adds. For a simple tool like DBT this time is very short, for a more complex tool like kubeflow it’s likely on the scale of months. This is highly dependent on how much of a change to workflows it causes.

**3.Size of Value**

Once you’re over the learning curve how much will you benefit? Will you consistently move faster across multiple projects. Will you be able to deliver higher quality products as a result?

**4.Quality and Momentum of the Development Team**

This is a factor I wouldn’t have considered a year ago, but that I take very seriously now. Some open-source packages and tools dissolve and disappear as fast as they appear. The speed of response to feedback and pull requests also varies wildly. If you see an active slack channel it’s a good sign. Commercial backing, even better. QDrant were excellent for me here, responsive and professional from the get go.

**5.How much will it teach you?**

Bit of a selfish one but if you’re planning in staying in a role for 2+ years your personal growth also matters to your employer. Getting heavily involved with a high growth package or tool can help you to grow as an ML Engineer or Software Engineer. Requesting features and reading the code required to construct the solutions (or contributing it and receiving feedbacks) is a great way to learn.

Similarly, some frameworks are highly opinionated. My decision to adopt Dagster taught me a lot about about Data Engineering principles in general because it is designed in a way that guides you towards a sustainable solution.

Others have absolutely excellent documentation. FastAPI really is in a category of its own in this respect.

Let me know if you find this interesting. Please follow if you’d like to read more similar content.
