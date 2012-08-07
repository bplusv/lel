<%-- 
    Document   : doSignIn
    Created on : Jun 14, 2012, 7:56:55 PM
    Author     : Luis Salazar <bp.lusv@gmail.com>
--%>

<root>
    <success>${success}</success>
    <c:if test="${!success}">
        <message><fmt:message key="load project fail" /></message>
    </c:if>
    <c:if test="${success}">
        <project id="{project.id}">
            <name>${project.name}</name>
            <description>${project.description}</description>
        </project>
    </c:if>
</root>