
# Set your repo
$repo = "sgshaji/InterviewPrepTracker"

# Define labels
$labels = @(
    @{ Name = "priority:P0"; Color = "d73a4a"; Description = "Highest priority" },
    @{ Name = "priority:P1"; Color = "e99695"; Description = "Medium priority" },
    @{ Name = "priority:P2"; Color = "f9d0c4"; Description = "Low priority" },
    @{ Name = "complexity:High"; Color = "b60205"; Description = "High effort or complexity" },
    @{ Name = "complexity:Medium"; Color = "fbca04"; Description = "Moderate complexity" },
    @{ Name = "complexity:Low"; Color = "0e8a16"; Description = "Quick win or low complexity" },
    @{ Name = "day:Day 1"; Color = "1d76db"; Description = "Scheduled for Day 1" },
    @{ Name = "day:Day 2"; Color = "5319e7"; Description = "Scheduled for Day 2" },
    @{ Name = "day:Day 3"; Color = "0052cc"; Description = "Scheduled for Day 3" }
)

foreach ($label in $labels) {
    gh label create "$($label.Name)" --repo $repo --color $($label.Color) --description "$($label.Description)"
}
