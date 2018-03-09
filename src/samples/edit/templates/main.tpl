<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
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

<!--   <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/habitat" id="habitat-button"
       class="<%- obj.locks['habitat'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.habitat %></span>
      Broad habitat
    </a>
  </li>
 -->
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/crop" id="crop-button"
       class="<%- obj.locks['crop'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.crop %></span>
      Crop type
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/soil-type" id="soil-type-button"
       class="<%- obj.locks['soil-type'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.soilType %></span>
      Soil type
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/soil-feature" id="soil-feature-button"
       class="<%- obj.locks['soil-feature'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.soilFeature %></span>
      Soil & landscape features
    </a>
  </li>
  
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/comment" id="comment-button"
       class="<%- obj.locks['comment'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%- obj.comment %></span>
      Notes
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
