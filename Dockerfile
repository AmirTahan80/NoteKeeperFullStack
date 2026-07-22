FROM node:22-alpine AS client-build
WORKDIR /src/ClientApp
COPY ClientApp/package*.json ./
RUN npm ci
COPY ClientApp/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server-build
WORKDIR /src
COPY NoteBookKeeper.Api/NoteBookKeeper.Api.csproj NoteBookKeeper.Api/
RUN dotnet restore NoteBookKeeper.Api/NoteBookKeeper.Api.csproj
COPY NoteBookKeeper.Api/ NoteBookKeeper.Api/
COPY --from=client-build /src/ClientApp/dist/NoteKeeper/ NoteBookKeeper.Api/wwwroot/
RUN dotnet publish NoteBookKeeper.Api/NoteBookKeeper.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=server-build /app/publish .
ENV ASPNETCORE_HTTP_PORTS=10000
EXPOSE 10000
USER $APP_UID
ENTRYPOINT ["dotnet", "NoteBookKeeper.Api.dll"]
