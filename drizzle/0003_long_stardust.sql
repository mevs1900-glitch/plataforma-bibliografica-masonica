CREATE TABLE `accessRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `accessRequests_id` PRIMARY KEY(`id`),
	CONSTRAINT `accessRequests_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('document_approved','document_rejected','new_document','announcement','access_approved','access_rejected') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;