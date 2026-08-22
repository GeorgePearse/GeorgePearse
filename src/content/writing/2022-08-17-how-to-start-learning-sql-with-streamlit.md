---
title: "How to Start Learning SQL with Streamlit and SQLite"
date: 2022-08-17
canonical: "https://medium.com/@george.pearse/how-to-start-learning-sql-with-streamlit-d3edad7494cd"
tags: ["sql", "data-engineering", "data-science", "python", "ml-so-good"]
---

Learning SQL is easier than starting to learn SQL. Data Engineering with Streamlit and SQLite.

![](/GeorgePearse/writing-images/ca5e4fdf45f8f585.png)

_Streamlit and SQLite, a match made in heaven. Image by Author_

For beginners trying to get into the data industry learning SQL is the obvious first step. This is easier said than done. While the statements that you need to know and understand are extremely simple. Database terminology is confusing and setting up a database is a piece of work you’re unlikely to be doing as a junior.

A more advanced solution is written up here:

[Stats for Quick Business Intelligence with Streamlit and SQL (medium.com)](https://medium.com/me/stats/post/cd6a9ba8a48f)

## SQLite

SQLite is the simplest DB you can get started with. It creates a local file on your laptop, against which you can run almost all the same queries that you would against a PostgresDB. Creating a connection simultaneously creates the DB and when running this demo you will see this file appear in the same directory.

## Streamlit

If you’re trying to break into data you’ll also probably be learning python. Pandas and its table object, a DataFrame are synonymous with both Data Engineering and Data Science. In this demo pandas is only used to read in the CSV and store the data between that state and SQLite.

Streamlit is the fastest way to create UIs with python. Its greatest for one-directional workflows. It’s recent, improved multi-page set-up makes it extremely quick to put together a few, simple, interacting flows.

Streamlit could not rank more highly against the metrics I use to recommend frameworks for adoption.

[A Framework for Picking Frameworks | by George Pearse | Aug, 2022 | Medium](https://medium.com/p/a4cd273e0e18)

## The Streamlit Code

<a href="https://medium.com/media/b8493e912f05a627fafc80f58cc77755/href">https://medium.com/media/b8493e912f05a627fafc80f58cc77755/href</a>

## **The Python Packages**

- sqlite3 and os are python in-built packages, they don’t need to be installed.

- Both pandas and streamlit must be ‘pip installed’. Other blogs will already explain how to get started with this in detail.

## Steps to Run

**From the same folder as the code above run:**

```
streamlit run streamlit_sqlite_demo.py
```

**Click on the localhost link:**

This should take you to a webpage where you’ll now have 3 pages, navigable via the sidepanel which will enable you to create a SQLite database, upload a CSV, and then run SQL queries against it. Your page may have a different colour scheme, this can be changed via the settings button at the top right of the website.

**1.Pick a name for your database (end in .db) and click “Create database”**

![](/GeorgePearse/writing-images/0b0e3f7cb5f7f0dc.png)

_create database. Image by Author._

**2.Find a CSV to upload, and give the table a name.**

![](/GeorgePearse/writing-images/e03b2d064f0b4a01.png)

_upload data. Image by Author_

[https://www.data.gov.uk/](https://www.data.gov.uk/) has a good store of CSVs to upload and run queries against. If you’re struggling to find an example (file must only have one row of headers) the below works, download the CSV named:

[MOD’s Senior Officials’ Expenses (2 Star and above) April to June 2020](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/930473/_MoD__Senior_Officials_Expenses__Report_Q1_20-21.csv)

from

[MOD: senior officials’ business expenses, hospitality and meetings, January to December 2020 — data.gov.uk](https://www.data.gov.uk/dataset/2dd8b18f-8fe6-44c8-8a20-2b92d16f7191/mod-senior-officials-business-expenses-hospitality-and-meetings-january-to-december-2020)

**3.Select a DB that you’ve created and run a SQL query.**

![](/GeorgePearse/writing-images/87c0b52199420afa.png)

_run query. Image by Author_

```
select * from
```

Is a good place to start.

This article does an excellent job of explaining how to publish your Streamlit App to Heroku.

[A quick tutorial on how to deploy your Streamlit app to Heroku. | by Navid Mashinchi | Towards Data Science](https://towardsdatascience.com/a-quick-tutorial-on-how-to-deploy-your-streamlit-app-to-heroku-874e1250dadd)

The application shown in the screenshots is currently available

[Streamlit (streamlitapp.com)](https://georgepearse-sqlite-streamlit-app-app-l4kyr3.streamlitapp.com/)

Hosted via Streamlit cloud.

If you find this interesting or helpful, please clap and follow. Let me know your thoughts, any questions, and all problems. Thanks!

Also looking for good publications to use. If you’re an editor and this content matches your reader’s interests please get in touch.

[Mlearning.ai Submission Suggestions](https://medium.com/mlearning-ai/mlearning-ai-submission-suggestions-b51e2b130bfb)
