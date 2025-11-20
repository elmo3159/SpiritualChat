-- Add overall_stars column to daily_fortunes table
-- This column stores the star rating (1-5) for the overall fortune

ALTER TABLE daily_fortunes
ADD COLUMN overall_stars INTEGER;

-- Add check constraint to ensure stars are between 1 and 5
ALTER TABLE daily_fortunes
ADD CONSTRAINT overall_stars_range CHECK (overall_stars >= 1 AND overall_stars <= 5);

-- Add comment to the column
COMMENT ON COLUMN daily_fortunes.overall_stars IS 'Star rating for overall fortune (1-5)';
