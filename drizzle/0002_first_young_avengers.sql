CREATE TABLE `invitationUses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invitationId` int NOT NULL,
	`userId` int NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitationUses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`createdBy` int NOT NULL,
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_code_unique` UNIQUE(`code`)
);
