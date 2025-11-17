export interface ILoad {
  id: number;
  load_title: string;
  load_description: string;
  load_image?: string | null;
  normative: number;
  load_category: string;
  reliability_coefficient: number;
  status?: boolean | null;
}

export interface IPaginatedLoads {
  items: ILoad[];
  total: number;
}

export interface ICrumb {
  label: string;
  path?: string;
  active?: boolean;
}

export interface ICartBadge {
  load_session_id: number | null;
  loads_count: number;
}

