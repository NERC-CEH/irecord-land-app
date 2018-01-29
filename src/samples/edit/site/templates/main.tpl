<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/crop-present" id="crop-present-button"
       class="<%- obj.locks['crop-present'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.cropPresent %></span>
      Crop, present
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/habitat" id="habitat-button"
       class="<%- obj.locks['habitat'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.habitat %></span>
      Broad habitat
    </a>
  </li>
</ul>
