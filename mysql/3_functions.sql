START TRANSACTION;
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

CREATE DEFINER=`root`@`%` PROCEDURE `GET_HEATEST_THREADS_ID` (IN `_page` TINYINT UNSIGNED, IN `_faculty` TINYINT UNSIGNED, IN `_query` CHAR(10) CHARSET utf8mb4, IN `_showHidden` BOOLEAN, IN `_quantity` INT UNSIGNED, IN `_offset` INT UNSIGNED, IN `_beforeTime` TIMESTAMP)   SELECT t.tid FROM (
     SELECT * FROM (
         SELECT 
         ROW_NUMBER() OVER (PARTITION BY `tid` ORDER BY `update_time` DESC) as row_num,
         `tid`, `new_degree` AS `deg`
         FROM threads_heat_logs
         WHERE `update_time` < _beforeTime
     ) AS ordered_degs
     WHERE row_num = 1
 ) AS latest_degs JOIN threads t ON t.tid = latest_degs.tid
WHERE 
	(t.pid = _page OR _page = 0) AND
	(t.fid = _faculty OR _faculty = 0) AND
	(t.title LIKE CONCAT('%', _query, '%') OR _query = '') AND
	(t.hidden = _showHidden OR _showHidden = TRUE)
ORDER BY `deg` DESC, `last_update_time` DESC
LIMIT _quantity OFFSET _offset$$

CREATE DEFINER=`root`@`%` PROCEDURE `GET_NEWEST_THREADS_ID` (IN `_page` TINYINT UNSIGNED, IN `_faculty` TINYINT UNSIGNED, IN `_query` CHAR(10) CHARSET utf8mb4, IN `_showHidden` BOOLEAN, IN `_quantity` INT UNSIGNED, IN `_offset` INT UNSIGNED, IN `_beforeTime` TIMESTAMP)  READS SQL DATA COMMENT '獲取最近更新的貼文' SELECT latest_times.tid FROM (
	SELECT `tid`, `real_last_update_time` FROM (
    	SELECT 
        	ROW_NUMBER() OVER (PARTITION BY `tid` ORDER BY `create_time` DESC) as row_num,
        	`tid`, `create_time` AS `real_last_update_time`
        FROM comments
        WHERE `create_time` < _beforeTime
        ) AS ordered_times
        WHERE row_num = 1
    ) AS latest_times JOIN threads t ON t.tid = latest_times.tid
WHERE 
	(t.pid = _page OR _page = 0) AND
	(t.fid = _faculty OR _faculty = 0) AND
	(t.title LIKE CONCAT('%', _query, '%') OR _query = '') AND
	(t.hidden = _showHidden OR _showHidden = TRUE)
ORDER BY `real_last_update_time` DESC
LIMIT _quantity OFFSET _offset$$

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
COMMIT;