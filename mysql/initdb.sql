SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+08:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


DELIMITER $$
CREATE DEFINER=`root`@`%` PROCEDURE `CREATE_REACTION` (IN `_commentID` INT UNSIGNED, IN `_userID` INT UNSIGNED, IN `_reactionType` TINYINT UNSIGNED)   BEGIN
    INSERT INTO comments_reactions (`cid`, `uid`, `type`) VALUES (_commentID, _userID, _reactionType);
    IF _reactionType = 1 THEN
        UPDATE comments SET `like_count` = `like_count` + 1 WHERE `cid` = _commentID;
    ELSEIF _reactionType = 2 THEN
        UPDATE comments SET `dislike_count` = `dislike_count` + 1 WHERE `cid` = _commentID;
    END IF;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `CREATE_THREAD` (IN `_title` CHAR(50) CHARSET utf8mb4, IN `_content` VARCHAR(5000) CHARSET utf8mb4, IN `_pid` TINYINT UNSIGNED, IN `_fid` TINYINT UNSIGNED, IN `_sender_uid` INT UNSIGNED)  DETERMINISTIC COMMENT '發佈貼文' BEGIN
    INSERT INTO comments (`content`, `sender_uid`) VALUES (_content, _sender_uid);
    SELECT @new_cid := LAST_INSERT_ID();
    INSERT INTO threads (`title`, `pid`, `fid`, `sender_uid`, `content_cid`) VALUES (_title, _pid, _fid, _sender_uid, @new_cid);
    SELECT @new_tid := LAST_INSERT_ID();
    UPDATE comments SET `tid` = @new_tid WHERE cid = @new_cid;
    INSERT INTO threads_heat_logs (`tid`) VALUES (@new_tid);
    UPDATE users_info SET `thread_count` = `thread_count` + 1 WHERE `uid` = _sender_uid;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GET_COMMENT` (IN `_commentID` INT UNSIGNED, IN `_userID` INT UNSIGNED)   BEGIN 
    SELECT c.*, u.nickname FROM comments c INNER JOIN users u ON c.sender_uid = u.uid WHERE c.cid = _commentID;
    IF _userID != 0 THEN
        SELECT type as reaction_type FROM comments_reactions WHERE cid = _commentID AND uid = _userID;
    END IF;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `GET_HEATEST_THREADS_ID` (IN `_page` TINYINT UNSIGNED, IN `_faculty` TINYINT UNSIGNED, IN `_query` CHAR(10) CHARSET utf8mb4, IN `_showHidden` BOOLEAN, IN `_quantity` INT UNSIGNED, IN `_offset` INT UNSIGNED, IN `_beforeTime` TIMESTAMP)   SELECT h.tid 
	FROM threads_heat_logs h
	JOIN (
        SELECT tid, MAX(update_time) as `deg_at` 
        FROM threads_heat_logs
        WHERE `update_time` < _beforeTime
        GROUP BY tid
    ) t_log ON 
    	t_log.tid = h.tid AND 
        t_log.deg_at = h.update_time
    INNER JOIN threads t ON t.tid = h.tid
    INNER JOIN comments c ON c.cid = t.content_cid
WHERE
    (c.status < 3 OR _showHidden = 1) AND
    (t.pid = _page OR _page = 0) AND
    (t.fid = _faculty OR _faculty = 0) AND
    (t.title LIKE CONCAT('%', _query, '%') OR _query = '')
ORDER BY
	h.new_degree DESC,
    h.update_time DESC
LIMIT _quantity OFFSET _offset$$

CREATE DEFINER=`root`@`%` PROCEDURE `GET_NEWEST_THREADS_ID` (IN `_page` TINYINT UNSIGNED, IN `_faculty` TINYINT UNSIGNED, IN `_query` CHAR(10) CHARSET utf8mb4, IN `_showHidden` BOOLEAN, IN `_quantity` INT UNSIGNED, IN `_offset` INT UNSIGNED, IN `_beforeTime` TIMESTAMP)  COMMENT '獲取最近更新的貼文' SELECT c.tid 
    FROM comments c
    JOIN (
        SELECT tid, MAX(cid) as `latest_cid` 
        FROM comments GROUP BY tid
    ) t_log ON t_log.latest_cid = c.cid
    INNER JOIN threads t ON t.tid = c.tid
    INNER JOIN comments t_content ON t_content.cid = t.content_cid
WHERE
    c.create_time < _beforeTime AND
    (t_content.status < 3 OR _showHidden = 1) AND
    (t.pid = _page OR _page = 0) AND
    (t.fid = _faculty OR _faculty = 0) AND
    (t.title LIKE CONCAT('%', _query, '%') OR _query = '')
ORDER BY c.create_time DESC
LIMIT _quantity
OFFSET _offset$$

CREATE DEFINER=`root`@`%` PROCEDURE `GET_THREADS_INTERACTIONS` (IN `_inDays` SMALLINT UNSIGNED, IN `_pointer` INT UNSIGNED, IN `_quantity` SMALLINT UNSIGNED)  READS SQL DATA COMMENT '獲取貼文的互動資料' BEGIN
	WITH t AS  (
        SELECT mT.tid, mT.content_cid
        FROM threads AS mT
                LEFT JOIN comments AS mC ON mC.cid = mT.content_cid
        WHERE (
            (mT.comment_count > 0 OR mC.like_count > 0 OR mC.dislike_count > 0) AND
            TIMESTAMPDIFF(DAY, mT.last_update_time, NOW()) < _inDays AND
            (mT.tid < _pointer OR _pointer = 0) AND
            mC.status < 3
        )
        ORDER BY tid DESC
        LIMIT _quantity
    ) 
    SELECT t.tid, `views_time`, `reactions_time`, `comments_time` FROM t
    LEFT JOIN (
        SELECT
            `tid`,
            JSON_ARRAYAGG(`create_times`) AS `views_time`
        FROM (
            SELECT 
                `tid`, 
                JSON_ARRAYAGG(UNIX_TIMESTAMP(`view_on`)) AS `create_times`
            FROM threads_view_logs
            WHERE `tid` IN (SELECT `tid` FROM t)
            GROUP BY `tid`, `viewer_uid`
        ) AS _v
        GROUP BY `tid`
    ) AS v ON v.tid = t.tid
    LEFT JOIN (
        SELECT
            `cid`,
            JSON_ARRAYAGG(UNIX_TIMESTAMP(`time`)) AS `reactions_time`
        FROM comments_reactions
        WHERE 
            `cid` IN (SELECT `content_cid` FROM t) AND
            `type` > 0
        GROUP BY `cid`
    ) AS r ON r.cid = t.content_cid
    LEFT JOIN (
        SELECT
            `tid`,
            JSON_ARRAYAGG(`create_times`) AS `comments_time`
        FROM (
            SELECT 
                `tid`,
                JSON_ARRAYAGG(UNIX_TIMESTAMP(`create_time`)) AS `create_times`
            FROM (
                SELECT 
                    `tid`, `sender_uid`, `create_time`,
                    ROW_NUMBER() OVER (
                        PARTITION BY `tid`
                        ORDER BY `cid`
                    ) AS rn
                FROM comments
                WHERE 
                    `tid` IN (SELECT `tid` FROM t) AND
                    `status` < 3
            ) AS __c
            WHERE `rn` > 1
            GROUP BY `tid`, `sender_uid`
         ) AS _c
         GROUP BY `tid`
    ) AS c ON c.tid = t.tid;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `POST_COMMENT` (IN `_content` VARCHAR(5000) CHARSET utf8mb4, IN `_tid` INT UNSIGNED, IN `_sender` INT UNSIGNED, IN `_replyto` INT UNSIGNED)  DETERMINISTIC COMMENT '發佈留言' BEGIN
	IF _replyto = 0 THEN
    	INSERT INTO comments (`content`, `tid`, `sender_uid`) VALUES (_content, _tid, _sender);
    ELSE
    	INSERT INTO comments (`content`, `tid`, `sender_uid`, `replyto_cid`) VALUES (_content, _tid, _sender, _replyto);
        UPDATE comments SET `reply_count` = `reply_count` + 1 WHERE `cid` = _replyto;
    END IF;
    SELECT @new_cid := LAST_INSERT_ID();
    UPDATE threads SET `comment_count` = `comment_count` + 1, `last_update_time` = NOW() WHERE `tid` = _tid;
    UPDATE users_info SET `comment_count` = `comment_count` + 1 WHERE `uid` = _sender;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `REMOVE_REACTION` (IN `_commentID` INT UNSIGNED, IN `_userID` INT UNSIGNED)   BEGIN
	DECLARE DeletedCount TINYINT;
    DECLARE ReationType TINYINT;
    SET ReationType := (SELECT `type` FROM comments_reactions WHERE `cid` = _commentID AND `uid` = _userID LIMIT 1);
    DELETE FROM comments_reactions WHERE `cid` = _commentID AND `uid` = _userID;
    SET DeletedCount := (SELECT ROW_COUNT());
    IF DeletedCount > 0 THEN
        IF ReationType = 1 THEN
            UPDATE comments SET `like_count` = `like_count` - DeletedCount WHERE `cid` = _commentID;
        ELSEIF ReationType = 2 THEN
            UPDATE comments SET `dislike_count` = `dislike_count` - DeletedCount WHERE `cid` = _commentID;
        END IF;
    END IF;
END$$

DELIMITER ;

CREATE TABLE `class_swap_requests` (
  `id` int UNSIGNED NOT NULL,
  `course_code` char(8) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `current_class` tinyint UNSIGNED NOT NULL,
  `expected_class` tinyint UNSIGNED NOT NULL,
  `requester_uid` int NOT NULL,
  `request_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `contact_method` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `contact_detail` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `responser_uid` int DEFAULT NULL,
  `response_on` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='科目交換請求表';

CREATE TABLE `comments` (
  `cid` int NOT NULL,
  `tid` int DEFAULT NULL,
  `sender_uid` int NOT NULL,
  `content` varchar(5000) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `like_count` int UNSIGNED NOT NULL DEFAULT '0',
  `dislike_count` int UNSIGNED NOT NULL DEFAULT '0',
  `reply_count` int UNSIGNED NOT NULL DEFAULT '0',
  `replyto_cid` int DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='留言表';

CREATE TABLE `comments_reactions` (
  `cid` int NOT NULL,
  `uid` int NOT NULL,
  `type` tinyint NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='留言互動表';

CREATE TABLE `comments_reports` (
  `cid` int NOT NULL,
  `by_uid` int NOT NULL,
  `reason_id` tinyint NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='留言舉報表';

CREATE TABLE `courses` (
  `code` char(8) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `name` char(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `min_class_num` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `max_class_num` tinyint UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='科目列表';

INSERT INTO `courses` (`code`, `name`, `min_class_num`, `max_class_num`) VALUES
('CCAH3001', 'Western Images of China', 4, 6),
('CCAH3003', 'The Process of Design', 1, 10),
('CCAH4010', 'From A Barren Rock to Asia\'s World City: A History of Modern Hong Kong', 1, 1),
('CCAH4012', 'Arts and Life - A Journey of Appreciation and Creation', 7, 20),
('CCAH4014', 'Histories, Societies and Identities: Connecting the Past to the Present', 4, 13),
('CCAH4015', 'Renewal and Regeneration: China Facing the World', 6, 11),
('CCAH4016', 'In Dialogue with Humanity', 4, 14),
('CCAH4018', 'Thinking about Science', 3, 26),
('CCBS3002', 'Elements of Business', 1, 8),
('CCBS4005', 'Introduction to Financial Accounting', 12, 19),
('CCBS4006', 'Introduction to Financial Management', 10, 20),
('CCBS4007', 'Introduction to Management', 9, 16),
('CCBS4008', 'Introduction to Marketing', 9, 16),
('CCBS4009', 'Microeconomics: Theory and Applications', 3, 5),
('CCBS4011', 'Global Business and Trade', 1, 2),
('CCBS4015', 'Strategic Brand Management', 1, 4),
('CCBS4017', 'Principles of Auditing', 1, 3),
('CCBS4018', 'Financial Markets and Institutions', 1, 2),
('CCBS4020', 'Integrated Project', 1, 11),
('CCCH4003', 'Advanced Chinese Language', 51, 75),
('CCCH4007', 'Introduction to Chinese Literary Criticism', 1, 4),
('CCCH4008', 'Introduction to Chinese Literature', 3, 8),
('CCCH4009', 'Studies of Modern and Contemporary Chinese Literature', 3, 4),
('CCCH4011', 'Modern Chinese Language', 1, 9),
('CCCH4012', 'Practical Chinese', 4, 10),
('CCCH4013', 'Reading and Writing in Chinese', 4, 7),
('CCCH4014', 'Studies of Classical Texts and Culture', 3, 4),
('CCCH4015', 'Practical Writing for Marketing and Public Relations', 1, 2),
('CCCH4016', 'Effective Chinese for Public Administration', 1, 2),
('CCCH4017', 'Chinese for Professional Communication Project', 1, 2),
('CCCH4018', 'Classical Chinese Poetry', 1, 2),
('CCCH4020', 'Modern Chinese Literature and Film', 1, 2),
('CCCH4022', 'Language, Society and Culture', 3, 4),
('CCCM4002', 'Foundations of Biochemistry', 1, 1),
('CCCM4005', 'Foundations of Pharmaceutics of Chinese Medicine', 1, 1),
('CCCM4008', 'Medical Prescriptions in Chinese Medicine', 1, 1),
('CCCM4022', 'Foundations of Acupuncture and Tui-na', 1, 1),
('CCCU3004', 'Understanding Hong Kong Popular Culture', 1, 10),
('CCCU3006', 'Youth and Culture', 1, 10),
('CCCU4001', 'Introduction to Film Studies', 1, 4),
('CCCU4007', 'The Journey of Self-Discovery', 21, 32),
('CCCU4013', 'Introduction to Media and Communications', 3, 10),
('CCCU4021', 'Media Publishing Industry and Production', 1, 5),
('CCCU4022', 'Creativity and Creative Industries', 1, 4),
('CCCU4027', 'Writing and Editing for Chinese Media', 1, 2),
('CCCU4034', 'Media, Identity and Consumer Society', 1, 2),
('CCCU4038', 'Global and Local Cultures: Perspectives and Lenses to Examine Communities and Self', 4, 9),
('CCCU4039', 'Intercultural Communication', 4, 8),
('CCCU4040', 'Exploring Hong Kong through Film and Popular Music', 9, 33),
('CCCU4041', 'Representation of People in Popular Art Forms', 4, 20),
('CCCU4042', 'Researching Culture and Media', 4, 6),
('CCEN3002', 'General English I', 20, 20),
('CCEN3003', 'General English II', 1, 18),
('CCEN3004', 'College Speaking', 1, 15),
('CCEN4003', 'Introduction to Academic English', 31, 34),
('CCEN4004', 'English for Academic Purposes I', 1, 99),
('CCEN4005', 'English for Academic Purposes II', 42, 72),
('CCEN4006', 'Introduction to Comparative Literature', 1, 5),
('CCEN4008', 'Introduction to Linguistics', 1, 8),
('CCEN4009', 'Literary Linguistics', 1, 3),
('CCEN4012', 'English for Arts and Humanities', 1, 32),
('CCEN4013', 'English for Science and Technology', 7, 11),
('CCEN4015', 'English for Healthcare Professionals', 13, 16),
('CCEN4016', 'Introduction to Applied Linguistics', 1, 2),
('CCEN4023', 'Dystopian Literature', 1, 3),
('CCEN4024', 'Introduction to Teaching English to Speakers of Other Languages (TESOL)', 1, 1),
('CCFN4017', 'The Economics of Money and Banking', 1, 2),
('CCIT4013', 'Enterprise Networking and Automation', 1, 1),
('CCIT4016', 'Introduction to Data Structures and Algorithms', 1, 12),
('CCIT4021', 'Discrete Mathematics', 4, 7),
('CCIT4026', 'Introduction to Computer Organization', 1, 2),
('CCIT4033', 'Introduction to Database Systems', 1, 6),
('CCIT4034', 'Switching, Wireless and Routing Essentials', 1, 2),
('CCIT4036', 'Security Audit Fundamentals', 1, 2),
('CCIT4037', 'Ethical Hacking', 1, 1),
('CCIT4039', 'Introduction to Computer Forensics', 1, 1),
('CCIT4040', 'Network Security', 1, 1),
('CCIT4041', 'Ethics and Computing Professionalism', 1, 5),
('CCIT4050', 'Project Management for Information Technology', 1, 5),
('CCIT4057', 'Information Management', 6, 11),
('CCIT4058', 'Internet Programming', 4, 5),
('CCIT4059', 'Mobile Application Development', 1, 4),
('CCIT4064', 'Microcontrollers', 1, 2),
('CCIT4075', 'Data Mining', 1, 2),
('CCIT4077', 'Project (Information Security)', 2, 2),
('CCIT4078', 'Project (Information Technology)', 3, 4),
('CCIT4079', 'Big Data Applications and Analytics', 3, 6),
('CCIT4080', 'Project on Knowledge Products Development', 6, 10),
('CCIT4082', 'Digital Logic and Systems', 1, 10),
('CCIT4085', 'Information Technology Fundamentals', 24, 38),
('CCIT4086', 'Techniques in Engineering', 1, 1),
('CCIT4088', 'Programming for Data Science', 1, 1),
('CCIT4091', 'Structures and Field Studies', 1, 1),
('CCIT4092', 'Data Visualization', 1, 1),
('CCIT4096', 'Project (Data Science)', 2, 2),
('CCIT4098', 'Cloud Computing in Practice', 1, 1),
('CCIT4100', 'Field Instrumentation and Site Investigation', 1, 1),
('CCIT4102', 'Properties of Construction Material', 1, 1),
('CCIT4103', 'Structural Mechanics', 1, 1),
('CCIT4104', 'Geotechnics', 1, 1),
('CCIT4105', 'Construction Project Management', 1, 1),
('CCJK3001', 'Introduction to Japanese Studies', 1, 4),
('CCJK3003', 'Japanese II', 1, 4),
('CCJK3004', 'Introduction to Korean', 1, 3),
('CCJK3006', 'Korean II', 1, 2),
('CCJK4007', 'Contemporary Korean Society', 1, 2),
('CCJK4011', 'Contemporary Japanese Society', 1, 3),
('CCLW4002', 'Obligations I', 1, 1),
('CCLW4003', 'The Hong Kong Basic Law', 1, 1),
('CCLW4007', 'Obligations II', 1, 1),
('CCMA4001', 'Quantitative Analysis I', 18, 19),
('CCMA4003', 'Calculus', 1, 13),
('CCMA4007', 'Quantitative Analysis II', 1, 4),
('CCMA4008', 'Elementary Statistics', 14, 36),
('CCMA4009', 'Applied Statistics', 20, 41),
('CCMK4002', 'Business Economics', 10, 17),
('CCPA4001', 'Fundamentals of Tonal Music I', 1, 1),
('CCPA4002', 'Introduction to Chinese Music', 1, 1),
('CCPA4005', 'Fundamentals of Tonal Music II', 1, 1),
('CCPH4001', 'Introduction to Philosophy', 1, 6),
('CCPH4005', 'Selected Topics in Philosophy', 1, 1),
('CCSA8002', 'Seminar Series', 2, 2),
('CCSS3002', 'Multiple Intelligences and Competencies', 12, 13),
('CCSS4001', 'Applied Psychology', 1, 18),
('CCSS4004', 'Intra- and Interpersonal Competencies', 9, 21),
('CCSS4005', 'Social Problems in Contemporary Societies', 4, 12),
('CCSS4007', 'Introduction to Political Science', 9, 14),
('CCSS4009', 'Introduction to Psychology', 4, 32),
('CCSS4011', 'Global Governance and International Organizations', 1, 1),
('CCSS4015', 'Sociology of Health', 1, 5),
('CCSS4019', 'Social Policy and Administration', 1, 3),
('CCSS4020', 'Introduction to Research Methods in Social Sciences', 6, 10),
('CCSS4021', 'Hong Kong Society: A Sociological Perspective', 1, 3),
('CCSS4024', 'Introduction to Counseling', 1, 5),
('CCSS4035', 'The Basics of Sociology', 8, 13),
('CCSS4043', 'Global Issues and Everyday Life', 4, 10),
('CCSS4044', 'Health, Technology and Society', 4, 8),
('CCSS4046', 'Social Psychology', 1, 2),
('CCSS4047', 'Sociology of the Family', 1, 2),
('CCSS4048', 'Introduction to Human Geography', 1, 3),
('CCSS4049', 'Sustainable Development in a Globalising World', 1, 3),
('CCSS4052', 'Urban and Regional Development in China', 1, 2),
('CCSS4053', 'Introduction to Public Policy and Administration', 1, 2),
('CCSS4054', 'Land and People in Hong Kong: A Field Survey', 1, 2),
('CCST3004', 'How Things in Everyday Life Work', 1, 7),
('CCST4009', 'Environmental Challenges and Sustainability', 5, 11),
('CCST4010', 'Food and Nutrition Basics', 4, 4),
('CCST4011', 'Biodiversity and Genetics', 1, 2),
('CCST4013', 'Introductory Organic Chemistry', 1, 2),
('CCST4015', 'Fundamentals of Thermodynamics, Waves and Electromagnetism', 1, 4),
('CCST4017', 'Molecular Biology and Biochemistry', 4, 5),
('CCST4018', 'Cell Biology and Physiology', 1, 3),
('CCST4023', 'From Molecules to Cells', 2, 2),
('CCST4027', 'Pharmacology', 1, 2),
('CCST4028', 'Nursing Care of the Older Adult', 1, 8),
('CCST4029', 'Inorganic Chemistry I', 2, 2),
('CCST4030', 'Analytical Chemistry I', 2, 2),
('CCST4035', 'Fluid/Solid Interactions in Earth Processes', 1, 1),
('CCST4039', 'Organic Chemistry I', 2, 2),
('CCST4040', 'Introductory Electricity and Magnetism', 1, 1),
('CCST4041', 'Geochemistry', 1, 1),
('CCST4047', 'Fundamentals of the Human Body', 1, 4),
('CCST4048', 'Pathology and Pathophysiology', 1, 2),
('CCST4060', 'Evolutionary Diversity', 1, 1),
('CCST4062', 'Methods in Physics II', 1, 1),
('CCST4074', 'Probability and Statistics I', 2, 2),
('CCST4077', 'Health Assessment', 1, 12),
('CCST4082', 'Biomedical Science', 1, 4),
('CCST4085', 'Biostatistics', 1, 1),
('CCST4086', 'Nature of the Universe', 2, 2),
('CCST4087', 'Environmental Life Science', 1, 1),
('CCST4091', 'Biological Sciences Laboratory Course', 3, 3),
('CCST4095', 'Introduction to Climate Science', 1, 1),
('CCST4098', 'Introductory Mechanics', 2, 2),
('CCST4099', 'University Mathematics II', 3, 3),
('CCST4100', 'Statistics: Ideas and Concepts', 2, 2),
('CCST4101', 'General Chemistry I', 4, 4),
('CCST4110', 'Multivariable Calculus and Linear Algebra', 2, 2),
('CCST4111', 'General Chemistry II', 2, 2),
('CCST4113', 'Nursing Practicum II', 1, 4),
('CCST4114', 'Geological Heritage of Hong Kong', 1, 1),
('CCST4116', 'Molecular Biochemistry', 1, 4),
('CCST4117', 'Biomedical Laboratory', 2, 2),
('CCST4122', 'Global Technology', 6, 11),
('CCST4123', 'Healthy Living', 21, 48),
('CCST4125', 'Introduction to the Earth-life System', 1, 1),
('CCST4126', 'Biogeography', 1, 1),
('CCST4127', 'Internship', 1, 1),
('CCST4128', 'Public Health', 1, 2),
('CCST4129', 'Introduction to Chinese Medicine', 1, 2),
('CCST4131', 'Environmental and Earth Science', 1, 1),
('CCST4136', 'Human Physiology', 1, 1),
('CCST4140', 'Fundamentals of Pharmacology', 1, 2),
('CCST4141', 'Introductory Analytical and Inorganic Chemistry', 1, 2),
('CCST4142', 'Environment and Resource Management', 1, 3),
('CCST4143', 'Contamination Management', 1, 1),
('CCST4147', 'Human Physiology', 1, 1);

CREATE TABLE `faculties` (
  `fid` tinyint NOT NULL,
  `eng_name` char(30) NOT NULL,
  `cht_name` char(15) NOT NULL,
  `chs_name` char(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='科系表';

INSERT INTO `faculties` (`fid`, `eng_name`, `cht_name`, `chs_name`) VALUES
(1, 'Arts and Humanities', '文學及人文', '文学及人文'),
(2, 'Economics and Business', '經濟及商學', '经济及商学'),
(3, 'Engineering and Technology', '工程及科技', '工程及科技'),
(4, 'English', '英文', '英文'),
(5, 'Mathematics and Sciences', '數學及科學', '数学及科学'),
(6, 'Social Sciences', '社會科學', '社会科学');

CREATE TABLE `programs` (
  `short_name` char(10) NOT NULL,
  `eng_name` char(100) NOT NULL,
  `cht_name` char(50) NOT NULL,
  `chs_name` char(50) NOT NULL,
  `fid` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='課程表';

CREATE TABLE `school_news` (
  `uuid` smallint NOT NULL,
  `title` char(100) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `public_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `discard_time` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='學校資訊表';

INSERT INTO `school_news` (`uuid`, `title`, `content`, `public_time`, `discard_time`) VALUES
(1, '繳交下學期學費', '再唔交學費就打電話同你地屋企人講', '2022-12-10 04:43:35', '2023-04-12 04:43:35'),
(2, '全新校內論壇上線', '快啲來留低你地嘅諗法', '2022-12-10 04:45:44', '2023-02-15 12:44:45'),
(3, 'HDIT即將成為全校最成功嘅科目', '預計該科在2333年擁有100%的升學率', '2022-12-10 04:48:03', '2024-01-02 04:48:03'),
(4, '所有學生需要在畢業前通過國安法考試', '我地都係比教育局逼嘅，大家拍硬檔做好場戲好來好去', '2022-12-10 04:50:05', '2023-03-10 04:50:05'),
(5, '學校已經全面轉為 Microsoft', '最大原因係Google教育版宜家唔再係無限儲存空間，我地唔想買', '2022-12-10 04:53:30', '2023-02-22 12:50:55'),
(6, '安心出行正式壽終正寢', '口罩令依然保持...', '2022-12-10 04:56:34', '2023-02-22 12:54:04');

CREATE TABLE `settings` (
  `version` tinyint NOT NULL COMMENT '設定版本',
  `class_swap_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '班級互換是否啟用',
  `study_parner_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '學習夥伴是否啟用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `settings` (`version`, `class_swap_enabled`, `study_parner_enabled`) VALUES
(1, 1, 1);

CREATE TABLE `threads` (
  `tid` int NOT NULL,
  `pid` tinyint NOT NULL,
  `fid` tinyint DEFAULT NULL,
  `title` char(50) NOT NULL,
  `content_cid` int NOT NULL,
  `sender_uid` int NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pined_cid` int DEFAULT NULL,
  `comment_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `threads_heat_logs` (
  `tid` int NOT NULL,
  `new_degree` float UNSIGNED NOT NULL DEFAULT '0',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='貼文熱度更新紀錄';

CREATE TABLE `threads_view_logs` (
  `tid` int NOT NULL,
  `viewer_uid` int NOT NULL,
  `duration` int UNSIGNED NOT NULL DEFAULT '0',
  `view_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='貼文閱讀量';

CREATE TABLE `users` (
  `uid` int NOT NULL,
  `nickname` char(20) NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户名表';

CREATE TABLE `users_baned` (
  `uid` int NOT NULL,
  `ban_type` tinyint NOT NULL,
  `ban_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unban_time` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户限制表';

CREATE TABLE `users_info` (
  `uid` int NOT NULL,
  `sid` int UNSIGNED NOT NULL,
  `fid` tinyint DEFAULT '0',
  `gender` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `thread_count` int UNSIGNED NOT NULL DEFAULT '0',
  `comment_count` int UNSIGNED NOT NULL DEFAULT '0',
  `graduated` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用戶資料表';

CREATE TABLE `users_login_info` (
  `token` binary(64) NOT NULL,
  `uid` int NOT NULL,
  `expire_on` timestamp NOT NULL,
  `device_name` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='登入訊息表';

CREATE TABLE `users_pwd` (
  `sid` int UNSIGNED NOT NULL,
  `hashed_pwd` binary(32) NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `should_change` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用戶密碼表';

CREATE TABLE `users_vf` (
  `vf_code` smallint UNSIGNED NOT NULL,
  `sid` int UNSIGNED NOT NULL,
  `expired_on` timestamp NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='驗證碼表';


ALTER TABLE `class_swap_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `same_uid_9` (`requester_uid`),
  ADD KEY `same_uid_11` (`responser_uid`),
  ADD KEY `same_course_1` (`course_code`);

ALTER TABLE `comments`
  ADD PRIMARY KEY (`cid`),
  ADD KEY `same_tid_3` (`sender_uid`),
  ADD KEY `same_cid_5` (`replyto_cid`),
  ADD KEY `same_tid_1` (`tid`);

ALTER TABLE `comments_reactions`
  ADD KEY `same_cid_3` (`cid`),
  ADD KEY `same_uid_6` (`uid`);

ALTER TABLE `comments_reports`
  ADD KEY `same_cid_4` (`cid`),
  ADD KEY `same_uid_7` (`by_uid`);

ALTER TABLE `courses`
  ADD PRIMARY KEY (`code`);

ALTER TABLE `faculties`
  ADD PRIMARY KEY (`fid`);

ALTER TABLE `programs`
  ADD UNIQUE KEY `short_name` (`short_name`,`eng_name`,`cht_name`,`chs_name`),
  ADD KEY `same_fid_3` (`fid`);

ALTER TABLE `school_news`
  ADD PRIMARY KEY (`uuid`);

ALTER TABLE `settings`
  ADD PRIMARY KEY (`version`);

ALTER TABLE `threads`
  ADD PRIMARY KEY (`tid`),
  ADD KEY `same_uid_2` (`sender_uid`),
  ADD KEY `same_cid_1` (`content_cid`),
  ADD KEY `same_cid_2` (`pined_cid`),
  ADD KEY `same_fid_1` (`fid`);

ALTER TABLE `threads_heat_logs`
  ADD PRIMARY KEY (`tid`,`update_time`),
  ADD KEY `thread_update_time` (`update_time`);

ALTER TABLE `threads_view_logs`
  ADD KEY `same_tid_4` (`tid`),
  ADD KEY `same_uid_12` (`viewer_uid`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`uid`);

ALTER TABLE `users_baned`
  ADD KEY `same_uid_5` (`uid`);

ALTER TABLE `users_info`
  ADD UNIQUE KEY `uid` (`uid`,`sid`),
  ADD UNIQUE KEY `sid` (`sid`),
  ADD KEY `same_fid_2` (`fid`);

ALTER TABLE `users_login_info`
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `same_uid_3` (`uid`);

ALTER TABLE `users_pwd`
  ADD UNIQUE KEY `sid` (`sid`);

ALTER TABLE `users_vf`
  ADD UNIQUE KEY `sid` (`sid`);


ALTER TABLE `class_swap_requests`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `comments`
  MODIFY `cid` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `faculties`
  MODIFY `fid` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `school_news`
  MODIFY `uuid` smallint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `settings`
  MODIFY `version` tinyint NOT NULL AUTO_INCREMENT COMMENT '設定版本', AUTO_INCREMENT=2;

ALTER TABLE `threads`
  MODIFY `tid` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `uid` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `class_swap_requests`
  ADD CONSTRAINT `same_course_1` FOREIGN KEY (`course_code`) REFERENCES `courses` (`code`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_uid_11` FOREIGN KEY (`responser_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_uid_9` FOREIGN KEY (`requester_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comments`
  ADD CONSTRAINT `same_cid_5` FOREIGN KEY (`replyto_cid`) REFERENCES `comments` (`cid`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `same_tid_1` FOREIGN KEY (`tid`) REFERENCES `threads` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_tid_3` FOREIGN KEY (`sender_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comments_reactions`
  ADD CONSTRAINT `same_cid_3` FOREIGN KEY (`cid`) REFERENCES `comments` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_uid_6` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comments_reports`
  ADD CONSTRAINT `same_cid_4` FOREIGN KEY (`cid`) REFERENCES `comments` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_uid_7` FOREIGN KEY (`by_uid`) REFERENCES `users` (`uid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `programs`
  ADD CONSTRAINT `same_fid_3` FOREIGN KEY (`fid`) REFERENCES `faculties` (`fid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `threads`
  ADD CONSTRAINT `same_cid_1` FOREIGN KEY (`content_cid`) REFERENCES `comments` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_cid_2` FOREIGN KEY (`pined_cid`) REFERENCES `comments` (`cid`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `same_fid_1` FOREIGN KEY (`fid`) REFERENCES `faculties` (`fid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_uid_2` FOREIGN KEY (`sender_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `threads_heat_logs`
  ADD CONSTRAINT `same_tid_2` FOREIGN KEY (`tid`) REFERENCES `threads` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `threads_view_logs`
  ADD CONSTRAINT `same_tid_4` FOREIGN KEY (`tid`) REFERENCES `threads` (`tid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_uid_12` FOREIGN KEY (`viewer_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users_baned`
  ADD CONSTRAINT `same_uid_5` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users_info`
  ADD CONSTRAINT `same_fid_2` FOREIGN KEY (`fid`) REFERENCES `faculties` (`fid`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `same_uid_1` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users_login_info`
  ADD CONSTRAINT `same_uid_3` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `users_pwd`
  ADD CONSTRAINT `same_uid_4` FOREIGN KEY (`sid`) REFERENCES `users_info` (`sid`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;