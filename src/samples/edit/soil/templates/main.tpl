<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/soil-type" id="soil-type-button"
       class="<%- obj.locks['soil-type'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.soilType %></span>
      Soil type
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/land-use" id="land-use-button"
       class="<%- obj.locks['land-use'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.landUse %></span>
      Land use
    </a>
  </li>
  
</ul>
