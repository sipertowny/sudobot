/*
 * This file is part of SudoBot.
 *
 * Copyright (C) 2021-2023 OSN Developers.
 *
 * SudoBot is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SudoBot is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with SudoBot. If not, see <https://www.gnu.org/licenses/>.
 */

import { logError } from "../components/io/Logger";
import Queue from "../utils/Queue";
import { safeChannelFetch } from "../utils/fetch";

export default class ScheduleMessageQueue extends Queue {
    async run(channelId: string, content: string) {
        const channel = await safeChannelFetch(this.guild, channelId);

        if (!channel || !channel.isTextBased()) {
            return;
        }

        if (content) {
            await channel
                .send({
                    content
                })
                .catch(logError);
        }
    }
}
