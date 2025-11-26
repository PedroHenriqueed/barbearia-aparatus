"use server";

import { actionClient } from "@/lib/action-client";
import {prisma} from "@/lib/prisma";
import z from "zod";
import {endOfDay, startOfDay} from "date-fns";
import { format } from "date-fns";


const inputSchema = z.object({
    barbershpId: z.string(),
    date: z.date(),
});

const timeList = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];


export const getDateAvailableTimeSlots = actionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: {babershopId, date} }) => {
        const bookings = await prisma.booking.findMany({
            where:{
                babershopId,
                date:{
                    gte: startOfDay(date),
                    lte: endOfDay(date),

                },
            },
        });
        const occupiedSlots = bookings.map(booking => 
            format(booking.date, "HH:mm"),
        );
        const availableTimesSlots = timeList.filter((slot) => !occupiedSlots.includes(slot),
    );
    return availableTimesSlots;
});