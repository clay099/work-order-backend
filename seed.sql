-- all password fields is password run through the hash function
INSERT INTO users (first_name, last_name, email, phone, street_address, address_city, address_zip, address_country, password) values ('Carisa', 'Colvin',' cc@gmail.com', 3354259154, '93959 Maya Stravenue', 'Luciousland', 72488, 'United States of America', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Kelly', 'Obrien', 'kobrien@outlook.com', 9255245218,'200 Ara Mills', 'West Jaynemouth', 77260, 'United States of America','$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Shirley', 'Harper','theharper@yahoo.com', 3055785415, '21270 Tommie Falls', 'East Abelville', 67762, 'United States of America','$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Christopher', 'Smith', 'smithman@hotmail.com', 9257418548, '21444 Prudence Radial', 'Ernaside', 69920, 'United States of America','$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Olivia', 'Hodges', 'olivia@gmail.com', 75485781542, '4692 Stephania Flat', 'East Clementland', 88374, 'United States of America','$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Gustavo', 'Salazar', 'gustavo.salazar@gmail.com', 6523657418, '185 Jenkins Crest', 'Laurinefort', 86937, 'United States of America', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Estrella', 'Hettinger', 'Estrella50@hotmail.com', 1475289635, '1784 Joan Falls', 'East Millie', 15520, 'United States of America', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Cruz', 'Kassulke', 'Cruz.Kassulke83@yahoo.com', 2156936557, '157 Tromp Creek', 'South Normastad', 84328, 'United States of America', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('test', 'user', 'user@gmail.com', 5742589635, '157 Tromp Creek', 'South Normastad', 84328, 'United States of America', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly');

-- all password fields is password run through the hash function
INSERT INTO tradesmen (first_name, last_name, phone, email, password) values ('Anissa', 'Breitenberg', 5874529558,' Breitenberg@gmail.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Nicklaus', 'Dickinson', 8741259638, 'Nicklaus.dickinson@yahoo.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Pietro', 'Stamm',1247583695, 'pietro@hotmail.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Nolan', 'Anderson', 2565879968, 'nolan@gmail.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Rashad', 'Bosco', 4578715472,' rashadbosco@outlook.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Ollie', 'Orn', 1253696875, 'ollie@gmail.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Johan', 'Osinski', 4052100047, 'josinski@yahoo.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Deshaun', 'Gleason', 5487896354, 'Deshaun.Gleason@gmail.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('Myra', 'Lebsack', 5248578596, 'Myra_Lebsack@yahoo.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly'),
('test', 'tradesmen', 8745698752, 'tradesmen@gmail.com', '$2b$12$MsNomKWMiOK24jJir.ASfO/mHwNHKVcOU/wtzdIh3GMDMQ7Gxvxly');

-- new proejcts
INSERT INTO projects(user_id, description, street_address,address_city, address_zip, address_country) VALUES (
  1, 'Sink is leaking', '93959 Maya Stravenue', 'Luciousland', 72488, 'United States of America'),
(1, 'Basic landscaping', '93959 Maya Stravenue', 'Luciousland', 72488, 'United States of America'),
(1, 're-paint 2 bedrooms', '93959 Maya Stravenue', 'Luciousland', 72488, 'United States of America'),
(2,'tile bathroom', '200 Ara Mills', 'West Jaynemouth', 77260, 'United States of America'),
(2,'Drywall repair', '200 Ara Mills', 'West Jaynemouth', 77260, 'United States of America'),
(3,'lawn mowing', '21270 Tommie Falls', 'East Abelville', 67762, 'United States of America');

--current projects
INSERT INTO projects(user_id, description, street_address,address_city, address_zip, address_country, price, tradesmen_id, status) VALUES (
  4, 'broken pipes', '21444 Prudence Radial', 'Ernaside', 69920, 'United States of America', 2000, 1, 'progressing'),
  (4, 'Outside patio ', '21444 Prudence Radial', 'Ernaside', 69920, 'United States of America', 20000, 2, 'completed'),
  (4, 'bathroom re-modle', '21444 Prudence Radial', 'Ernaside', 69920, 'United States of America', 20000, 2,'cancelled'),
  (4, 'clean exterior windows', '21444 Prudence Radial', 'Ernaside', 69920, 'United States of America', 5000, 3, 'progressing'),
  (4, 're-tile roof', '1 Sacramento Street', 'Sacramento', 30000, 'United States of America', 20000, 4, 'completed'),
  (5, 'install side of house window', '4692 Stephania Flat', 'East Clementland', 88374, 'United States of America', 1000, 1, 'progressing');

  -- user chat
  INSERT INTO chat(project_id, user_id, comment, sent_at) VALUES (
    7, 4,'what time will you come over?', '2020-08-19 10:20:53'), 
  (7, 4, 'works for me', '2020-08-19 10:55:03'),
  (8, 4, 'look forward to getting it all done', '2020-08-24 08:30:00'),
  (9, 4, 'sorry i don''t need this done anymore', '2020-07-01 19:10:15'), 
  (12, 5, 'how long do you think the project will take?', '2020-07-26 10:55:03'), 
  (12, 5, 'that sounds good, can you start this weekend?', '2020-07-27 09:01:00'), 
  (12, 5, 'Thank you for your time and help on this project', '2020-08-01 17:44:10');

  -- tradesmen chat
  INSERT INTO chat(project_id, tradesmen_id, comment, sent_at) VALUES(7, 1, 'i can be there by 4:30pm does that work?', '2020-08-19 10:21:20'),
  (8, 2, 'great to see you, let me know if there is any more work i can assist you with', '2020-08-29 13:42:12'),
  (9, 2, 'okay thank you for letting me know','2020-07-03 09:20:25'), 
  (12, 1, 'i think i should take 2 days. When do you want for me to start?', '2020-07-27 08:10:27'), 
  (12, 1, 'This weekend sounds good. I will be around starting at 9', '2020-07-27 22:00:55');

  INSERT INTO reviews(user_id, tradesmen_id, project_id, review_comment, review_rating) VALUES(4,1,7, 'great work, can''t recomment more highly', 10),
  (4, 2, 8,'Very professional and highyl efficient', 9), 
  (4, 3, 10, 'work not up to standards', 3);

  INSERT INTO photos(project_id, photo_link, description, after, user_id) VALUES (8, 'https://secure.img1-fg.wfcdn.com/im/38471540/resize-h800%5Ecompr-r85/1096/109651865/11+Piece+Rattan+Sofa+Seating+Group+with+Cushions.jpg', 'Patio after reno', TRUE, 4), 
  (8, 'https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fill,g_auto,w_1500/at%2FVida_Cornelious_before_tagged','Patio before shot', FALSE, 4);