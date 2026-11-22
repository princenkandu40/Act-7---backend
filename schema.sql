
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL CHECK (
        length(trim(title)) BETWEEN 3 AND 80
    ),

    category TEXT NOT NULL CHECK (
        length(trim(category)) BETWEEN 2 AND 40
    ),

    description TEXT NOT NULL CHECK (
        length(trim(description)) BETWEEN 5 AND 300
    ),

    status TEXT NOT NULL CHECK (
        status IN ('Pending', 'In progress', 'Completed')
    )
);
