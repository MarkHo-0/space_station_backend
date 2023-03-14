START TRANSACTION;

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

CREATE TABLE `faculties` (
  `fid` tinyint NOT NULL,
  `eng_name` char(30) NOT NULL,
  `cht_name` char(15) NOT NULL,
  `chs_name` char(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='科系表';

CREATE TABLE `school_news` (
  `uuid` smallint NOT NULL,
  `title` char(100) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `public_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `discard_time` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='學校資訊表';

CREATE TABLE `settings` (
  `version` tinyint NOT NULL COMMENT '設定版本',
  `class_swap_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '班級互換是否啟用',
  `study_parner_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '學習夥伴是否啟用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `study_partner_posts` (
  `id` int UNSIGNED NOT NULL,
  `publisher_uid` int NOT NULL,
  `course_code` char(8) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `aimed_grade` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `description` varchar(1000) NOT NULL,
  `contact_method` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `contact_detail` varchar(320) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `publish_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='學習夥伴招聘表';

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
  `comment_count` int UNSIGNED NOT NULL DEFAULT '0',
  `hidden` tinyint(1) NOT NULL DEFAULT '0'
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
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `thread_count` int UNSIGNED NOT NULL DEFAULT '0',
  `comment_count` int UNSIGNED NOT NULL DEFAULT '0'
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
  ADD PRIMARY KEY (`code`),
  ADD KEY `code` (`code`,`name`);

ALTER TABLE `faculties`
  ADD PRIMARY KEY (`fid`);

ALTER TABLE `school_news`
  ADD PRIMARY KEY (`uuid`);

ALTER TABLE `settings`
  ADD PRIMARY KEY (`version`);

ALTER TABLE `study_partner_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `same_uid_13` (`publisher_uid`),
  ADD KEY `same_course_2` (`course_code`);

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
  ADD PRIMARY KEY (`uid`,`ban_time`),
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
  MODIFY `fid` tinyint NOT NULL AUTO_INCREMENT;

ALTER TABLE `school_news`
  MODIFY `uuid` smallint NOT NULL AUTO_INCREMENT;

ALTER TABLE `settings`
  MODIFY `version` tinyint NOT NULL AUTO_INCREMENT COMMENT '設定版本';

ALTER TABLE `study_partner_posts`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

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

ALTER TABLE `study_partner_posts`
  ADD CONSTRAINT `same_course_2` FOREIGN KEY (`course_code`) REFERENCES `courses` (`code`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `same_uid_13` FOREIGN KEY (`publisher_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

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
