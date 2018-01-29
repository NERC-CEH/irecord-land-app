<div class="pull-left">
  <a href="#info" class="menu-link icon icon-menu"></a>
  <a href="#user/activities" id="activities-btn" class="icon icon-users <%- obj.group_title ? 'on' : '' %>"></a>
</div>
<div class="pull-right">
  <button id="create-new-btn" class="icon icon-plus"></button>
</div>

<%  if(obj.group_title || obj.training) { %>
<div id="subheader">
  <% if (obj.group_title) { %>
  <div class="activity"><%- obj.group_title %></div>
  <% } %>
  <% if (obj.training) { %>
  <div class="training">Training</div>
  <% } %>
</div>
<% } %>