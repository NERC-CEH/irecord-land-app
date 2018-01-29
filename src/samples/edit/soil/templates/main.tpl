<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/depth" id="depth-button"
       class="<%- obj.locks['depth'] ? 'lock' : 'navigate-right' %>">
      <% if (obj.errors['depth']) { %>
      <span class="media-object pull-right descript error"><%- obj.errors['depth'] %></span>
      <% } else { %>
      <span class="media-object pull-right descript"><%- obj.depth %></span>
      <% } %>
      Sample depth
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/sample-type" id="sample-type-button"
       class="<%- obj.locks['sample-type'] ? 'lock' : 'navigate-right' %>">
      <% if (obj.errors['sample-type']) { %>
      <span class="media-object pull-right descript error"><%- obj.errors['sample-type'] %></span>
      <% } else { %>
      <span class="media-object pull-right descript"><%- obj.sampleType %></span>
      <% } %>
      Sample type
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
    <a href="#samples/<%- obj.id %>/edit/calcareous" id="calcareous-button"
       class="<%- obj.locks['calcareous'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.calcareous %></span>
      Calcareous soil
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/structure-score" id="structure-score-button"
       class="<%- obj.locks['structure-score'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.structureScore %></span>
      Structure score
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/structure-notes" id="structure-notes-button"
       class="<%- obj.locks['structure-notes'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.structureNotes %></span>
      Structure notes
    </a>
  </li>

  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/land-use" id="land-use-button"
       class="<%- obj.locks['land-use'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.landUse %></span>
      Land use
    </a>
  </li>
  
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/sample-notes" id="sample-notes-button"
       class="<%- obj.locks['sample-notes'] ? 'lock' : 'navigate-right' %>">
      <span class="media-object pull-right descript"><%= obj.sampleNotes %></span>
      Sample notes
    </a>
  </li>
</ul>
