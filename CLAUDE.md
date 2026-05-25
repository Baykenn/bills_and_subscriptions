
## Claude Dashboard — Task Inbox

You can create Kanban cards on the Claude Dashboard by writing a JSON file to:
`.dashboard/inbox/<anything>.json`

```json
{
  "title": "Task title (required)",
  "description": "Optional description",
  "column": "backlog | in-progress | done  (defaults to backlog)",
  "tags": ["optional", "tags"]
}
```

The dashboard picks it up, creates the card, then deletes the file automatically.
