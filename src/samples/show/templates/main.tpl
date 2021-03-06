<div class="info-message">
  <p>This record has been submitted and cannot be edited within this App.
<!--
    <% if (obj.id) { %>
    <a href="<%= obj.site_url %>/poc-user-edit?sample_id=<%= obj.id %>"
       class="btn btn-block btn-narrow">
      Edit on iRecord Land
      <span class="pull-right icon icon-link-ext"></span>
    </a>
    <% } else { %>
      Go to the <a href="<%= obj.site_url %>">iRecord Land website</a> to edit.</p>
    <% } %>
--!>
</div>

<ul class="table-view core inputs info no-top">
  <li class="table-view-cell">
    <span class="media-object pull-right descript"><%- obj.date %></span>
    Date
  </li>
  
  <li class="table-view-cell">
    <span class="media-object pull-right descript"><%- obj.locationName %></span>
    <span class="media-object pull-right descript"><%- obj.location %></span>
    Location
  </li>

  <li class="table-view-cell">
    <span class="media-object pull-right descript"><%- obj['habitat'] %></span>
    <span class="media-object pull-right descript"><%- obj['crop'] %></span>
    Habitat & crop
  </li>
  
  <li class="table-view-cell">
    <span class="media-object pull-right descript"><%- obj['soil-type'] %></span>
    <span class="media-object pull-right descript"><%- obj['soil-feature'] %></span>
    Soil
  </li>

  <li class="table-view-cell">
    <span class="media-object pull-right descript"><%- obj['comment'] %></span>
    Notes
  </li>

  <% if (obj.group_title) { %>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-users"></span>
    <span class="media-object pull-right descript"><%- obj.group_title %></span>
    Activity
  </li>
  <% } %>
  
  <% if (obj.media.length) { %>
    <li id="img-array">
      <% obj.media.each((image) =>{ %>
        <img src="<%- image.getURL() %>" alt="">
      <% }) %>
    </li>
  <% } %>
</ul>

<% if (obj.useExperiments) { %>
  <button id="resend-btn" class="btn btn-narrow btn-negative btn-block">Resend the record</button>
<% } %>

<div id="occurrence-id"><%- obj.cid %></div>
