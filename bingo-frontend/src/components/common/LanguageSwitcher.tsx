import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Button, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const languages = [
    { key: 'th', label: '🇹🇭 ไทย', name: 'Thai' },
    { key: 'en', label: '🇺🇸 English', name: 'English' },
];

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const currentLang = languages.find(l => l.key === i18n.language) || languages[0];

    const items: MenuProps['items'] = languages.map(lang => ({
        key: lang.key,
        label: lang.label,
        onClick: () => i18n.changeLanguage(lang.key),
    }));

    return (
        <Dropdown menu={{ items }} placement="bottomRight">
            <Button
                type="text"
                icon={<GlobalOutlined />}
                style={{ color: '#fff' }}
            >
                <Space>
                    {currentLang.label}
                </Space>
            </Button>
        </Dropdown>
    );
};

export default LanguageSwitcher;
