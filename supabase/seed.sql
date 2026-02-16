-- ---------------------------------------------------------------
-- Seed data: 6 vehicles matching the Space City Rentals fleet
-- Run this AFTER all migrations have been applied.
-- ---------------------------------------------------------------

INSERT INTO vehicles (slug, name, headline, description, daily_price_cents, images, experience_tags, rental_count, is_active)
VALUES
  (
    'rolls-royce-ghost',
    'Rolls-Royce Ghost',
    'Move in Silence. Let the Car Do the Talking.',
    'The Rolls-Royce Ghost is the ultimate expression of understated luxury. Glide through Houston in absolute silence while commanding every room you enter. This is the car for those who don''t need to announce their arrival — the car does it for them.',
    120000,
    ARRAY['/images/fleet-rollsroyce.jpg'],
    ARRAY['Date Night', 'Wedding Day', 'Statement'],
    42,
    true
  ),
  (
    'lamborghini-huracan',
    'Lamborghini Huracan',
    'Make an Entrance They Won''t Forget.',
    'The Lamborghini Huracan is raw Italian engineering wrapped in aggressive design. V10 naturally aspirated fury that turns gas stations into photoshoots and red lights into runway moments. This is not a subtle car. This is your main character moment.',
    95000,
    ARRAY['/images/fleet-lamborghini.jpg'],
    ARRAY['Content Ready', 'Statement', 'Boss Move'],
    38,
    true
  ),
  (
    'dodge-hellcat-widebody',
    'Dodge Hellcat Widebody',
    'For When Subtle Isn''t the Point.',
    'The Hellcat Widebody is 717 horsepower of American muscle with fender flares that dare you to look away. The supercharger whine announces you three blocks before you arrive. Houston''s car meets, takeovers, and content creators know this sound.',
    45000,
    ARRAY['/images/fleet-hellcat.jpg'],
    ARRAY['Weekend Takeover', 'Content Ready', 'Boss Move'],
    55,
    true
  ),
  (
    'mercedes-maybach-s-class',
    'Mercedes-Maybach S-Class',
    'Executive Presence. Absolute Comfort.',
    'The Maybach S-Class is where business gets done. Rear executive seating, champagne flutes, and a cabin so quiet your conference call sounds like a boardroom. Pull up to closings, galas, and dinners where presence is currency.',
    80000,
    ARRAY['/images/fleet-maybach.jpg'],
    ARRAY['Boss Move', 'Date Night', 'Wedding Day'],
    31,
    true
  ),
  (
    'range-rover-sport',
    'Range Rover Sport',
    'Command the Road. Own the Weekend.',
    'The Range Rover Sport is Houston''s go-anywhere luxury SUV. Whether it''s a day trip to Galveston, a tailgate at NRG, or just dominating the Galleria parking garage, this is the elevated everyday. Luxury that handles real life.',
    55000,
    ARRAY['/images/fleet-rangerover.jpg'],
    ARRAY['Weekend Takeover', 'Boss Move'],
    47,
    true
  ),
  (
    'chevrolet-corvette-c8',
    'Chevrolet Corvette C8',
    'Mid-Engine. Maximum Impact.',
    'The C8 Corvette rewrote the rules — mid-engine, supercar silhouette, at a price that lets you book it for the whole weekend. Perfect for date nights, content shoots, or just reminding yourself what living feels like at 6,500 RPM.',
    50000,
    ARRAY['/images/fleet-corvette.jpg'],
    ARRAY['Date Night', 'Content Ready', 'Weekend Takeover'],
    29,
    true
  );
