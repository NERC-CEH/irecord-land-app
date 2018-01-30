<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/habitat" id="habitat-button"
       class="<%- obj.locks['habitat'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.habitat %></span>
      Broad habitat
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/crop" id="crop-button"
       class="<%- obj.locks['crop'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.crop %></span>
      Crop type
    </a>
  </li>

</ul>
