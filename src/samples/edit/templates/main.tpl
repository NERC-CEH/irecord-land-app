<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a id="uid-button">
      <span class="pull-right descript"><%- obj.uid %></span>
      Our reference
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/your-ref" id="your-ref-button"
       class="<%- obj.locks['your-ref'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%- obj.yourRef %></span>
      Your reference
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/date" id="date-button"
       class="<%- obj.locks['date'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%- obj.date %></span>
      Date
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/location" id="location-button"
       class="<%- obj.locks['location'] || obj.locks['locationName'] ? '' : 'navigate-right' %>">

      <% if (obj.location) { %>
      <span class="location media-object pull-right descript <%- obj.locks['location'] ? 'lock' : '' %>"><%- obj.location %></span>
      <% } else { %>
      <% if (obj.isLocating) { %>
      <span class="media-object pull-right descript warn">Locating...</span>
      <% } else { %>
      <span class="media-object pull-right descript error">Location missing</span>
      <% } %>
      <% } %>
      Location
    </a>

  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/country" id="country-button"
       class="<%- obj.locks['country'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%- obj.country %></span>
      Country
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/soil" id="soil-button" 
      class="navigate-right">
       <% if (obj.errors['soil']) { %>
      <span class="media-object pull-right descript error">Error</span>
      <% } else { %>
      <span class="media-object pull-right descript"><%- obj.soil %></span>
      <% } %>
      Soil
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/site" id="site-button" 
      class="navigate-right">
       <% if (obj.errors['site']) { %>
      <span class="media-object pull-right descript error">Error</span>
      <% } else { %>
      <span class="media-object pull-right descript"><%- obj.site %></span>
      <% } %>
      Site
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/laboratory" id="laboratory-button" 
      class="navigate-right">
       <% if (obj.errors['laboratory']) { %>
      <span class="media-object pull-right descript error">Error</span>
      <% } else { %>
      <span class="media-object pull-right descript"><%- obj.laboratory %></span>
      <% } %>
      Laboratory
    </a>
  </li>

  <% if (obj.group_title) { %>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/activity" id="activity-button"
       class="<%- obj.locks['activity'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-left icon icon-users"></span>
      <span class="media-object pull-right descript"><%- obj.group_title %></span>
      Activity
    </a>
  </li>
  <% } %>
</ul>
