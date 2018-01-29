<ul class="table-view core inputs no-top <%- obj.isSynchronising ? 'disabled' : '' %>">
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/lab-name" id="lab-name-button"
       class="<%- obj.locks['lab-name'] ? 'lock' : 'navigate-right' %>">
      <% if (obj.errors['lab-name']) { %>
      <span class="media-object pull-right descript error"><%- obj.errors['lab-name'] %></span>
      <% } else { %>
      <span class="media-object pull-right descript"><%- obj.labName %></span>
      <% } %>
      Name
    </a>
  </li>
  <li class="table-view-cell">
    <a href="#samples/<%- obj.id %>/edit/client-code" id="client-code-button"
       class="<%- obj.locks['client-code'] ? 'lock' : 'navigate-right' %>">
      <% if (obj.errors['client-code']) { %>
      <span class="media-object pull-right descript error"><%- obj.errors['client-code'] %></span>
      <% } else { %>
      <span class="media-object pull-right descript"><%- obj.clientCode %></span>
      <% } %>
      Client code
    </a>
  </li>
</ul>
