export enum ActionType {
	Button = 'button',
	Modal = 'modal',
	SelectMenu = 'menu',
}

export enum ButtonActionID {
	ConfigureSettings = 'configure',
	SubmitIdentity = 'submit_identity',
	VerifyApplication = 'verify_application',
}

export enum ModalActionID {
	ConfigureSettings = 'configure',
	SubmitIdentity = 'submit_identity',
}

export enum ModalInputsID {
	ProductUrl = 'product_url',
	GoogleSheetId = 'google_sheet_id',

	PersonName = 'person_name',
	FavoriteFruit = 'favorite_fruit',
}

export enum SettingsActions {
	ProductURL = 'product_url',
	PurchaseDelay = 'purchase_delay',
	ResetUnverifiedRole = 'reset_unverified_role',
	ToggleAutoVerify = 'toggle_auto_verify',
	EditGoogleSheetId = 'google_sheet_id',
}

export enum SelectMenuActionID {
	ConfigureRoles = 'configure_role_menu',
	ConfigureLogsChannel = 'configure_logs_channel',
}
