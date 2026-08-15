---
layout: page
title: Blog Archive
description: "Every hidden gem भारतByDay has covered, organised by region and theme."
---

<div class="archive-page">
  <p class="archive-note">Click a tag to jump straight to it.</p>

  {%- for tag in site.tags -%}
  {%- assign tag_slug = tag[0] | slugify -%}
  <section class="archive-tag-group" id="{{ tag_slug }}">
    <h3 class="archive-tag">{{ tag[0] }}</h3>
    <ul class="archive-list">
      {%- for post in tag[1] -%}
      <li class="archive-item">
        <time class="archive-date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %Y" }}</time>
        <a class="archive-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        {%- if post.description -%}
        <p class="archive-desc">{{ post.description | escape }}</p>
        {%- endif -%}
      </li>
      {%- endfor -%}
    </ul>
  </section>
  {%- endfor -%}

  {%- if site.posts.size == 0 -%}
  <p>No posts yet — the archive fills up one hidden gem a day. Check back soon.</p>
  {%- endif -%}
</div>
