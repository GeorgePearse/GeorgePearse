---
title: "Quick Business Intelligence with Streamlit and SQL"
date: 2022-08-20
canonical: "https://medium.com/@george.pearse/quick-business-intelligence-with-streamlit-and-sql-cd6a9ba8a48f"
tags: ["data-science", "python", "programming", "ml-so-good", "data-visualization"]
---

## Quick Business Intelligence with Streamlit, SQL and Plotly

Business Intelligence so simple you can edit the source code yourself.

![](/GeorgePearse/writing-images/9f80aece8154b632.png)

_Streamlit and Plotly. A match made in heaven._

As soon as you have a few customers seriously using your product you need to get started with your analytics. Many would be tempted to start with a full blown Superset and Snowflake Modern Data Stack. Often this is a great solution, often it’s overkill.

If you’re analysing medium to large datasets it’s much faster to perform your transformations in SQL to minimise the amount of data that needs to be transferred over the network.

<a href="https://medium.com/media/a78c5543ab42b09367ffeeef091ba260/href">https://medium.com/media/a78c5543ab42b09367ffeeef091ba260/href</a>

And with the development of tools like DBT and Dagster that make scheduling transformations extremely easy, there’s no need for heavy or complex transformation and caching layers in your BI tool. DBT can manage the transformations and an orchestration layer can frequently materialise data in the structure it’s needed for graphing to keep things performant.

<a href="https://medium.com/media/b737b6554acfcd9bd95a5b5910aff15d/href">https://medium.com/media/b737b6554acfcd9bd95a5b5910aff15d/href</a>

The vast majority of plots just have an X axis value and a Y axis value, I would be tempted to simplify the interface so that the first column is always the X input and the second always the Y input.

Be warned, the happy path for this app is narrow. Building more and more into it and writing up each step as I go. Once it becomes a tidy and simple solution I’ll make it available on Docker Hub and pypi as the quickest route to effective and efficient business intelligence.

> The only low-code Business Intelligence solution on PyPi (maybe)

I plan to add ways to save queries, save chart config, integrate DBT, connect to Snowflake, and access the results of your saved queries via API endpoints.

If this work interests you please clap and follow. I’m going to continue to create tooling that is easy to tweak and play with across Analytics and Machine Learning over the next few months.

[Mlearning.ai Submission Suggestions](https://medium.com/mlearning-ai/mlearning-ai-submission-suggestions-b51e2b130bfb)
