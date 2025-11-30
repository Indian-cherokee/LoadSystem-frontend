import type { IPaginatedLoads } from '../types';

const baseUrl = import.meta.env.BASE_URL;

export const LOADS_MOCK: IPaginatedLoads = {
  total: 3,
  items: [
    {
      id: 1,
      load_title: 'Нагрузка от собственного веса',
      load_description: 'Нагрузка от собственного веса конструкций и материалов',
      load_image: `${baseUrl}mock_images/default.png`,
      normative: 1.5,
      load_category: 'Постоянная',
      reliability_coefficient: 1.1,
      status: true,
    },
    {
      id: 2,
      load_title: 'Снеговая нагрузка',
      load_description: 'Нагрузка от снега на покрытие здания',
      load_image: `${baseUrl}mock_images/default.png`,
      normative: 1.8,
      load_category: 'Временная',
      reliability_coefficient: 1.4,
      status: true,
    },
    {
      id: 3,
      load_title: 'Ветровая нагрузка',
      load_description: 'Нагрузка от ветра на ограждающие конструкции',
      load_image: `${baseUrl}mock_images/default.png`,
      normative: 0.6,
      load_category: 'Временная',
      reliability_coefficient: 1.2,
      status: true,
    },
  ],
};

